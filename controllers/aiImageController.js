const { Mistral } = require('@mistralai/mistralai');
const { fal } = require('@fal-ai/client');
const GeneratedImage = require('../models/GeneratedImage');

/**
 * POST /api/v1/ai/generate-image
 * Body: { topic, style, aspectRatio }
 *
 * Flow:
 * 1. Use Mistral to generate a structured Instagram-ready image prompt + caption + hashtags
 * 2. Dynamically choose the best fal.ai model based on style
 * 3. Generate a realistic, social-media-optimized image
 * 4. Save image details in Database
 */
exports.generateImage = async (req, res) => {
  const { topic, style = 'Photorealistic', aspectRatio = '1:1' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required',
    });
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Decide model + generation philosophy
    // ─────────────────────────────────────────────────────────────
    let targetModel = 'fal-ai/flux-pro';
    let inferenceSteps = 32;
    let guidanceScale = 5.5;
    let styleGuidelines = '';

    const lowerStyle = style.toLowerCase();

    if (['photorealistic', 'lifestyle', 'minimalist', 'cinematic'].includes(lowerStyle)) {
      targetModel = 'fal-ai/flux-pro';
      inferenceSteps = 32;
      guidanceScale = 5.0;
      styleGuidelines = `
STYLE FOCUS:
- Ultra-realistic Instagram lifestyle photography
- Authentic, candid, unposed real-world moments
- Shot on a high-end smartphone or DSLR camera (e.g., 35mm lens, f/1.8, natural depth of field)
- Natural lighting (e.g., golden hour, soft overcast, or cinematic ambient light)
- Include "slightly uneven fur/hair texture", "natural skin texture", and "subtle natural flaws"
- Use "natural film-like color grading, slightly muted"
- Believable environments with real-world physics and textures

AVOID (CRITICAL):
- Words like: "Hyperrealistic", "8K", "Masterpiece", "Ultra-detailed", "Trending on ArtStation"
- Plastic, airbrushed, CGI, or stock-photo perfection
- Overly vibrant, HDR, or artificially saturated colors
- Perfect symmetry or stiff, unnatural poses
      `.trim();
    } else if (['fantasy', 'digital art', 'anime', 'sci-fi'].includes(lowerStyle)) {
      targetModel = 'fal-ai/z-image/turbo';
      inferenceSteps = 28;
      guidanceScale = 7.5;
      styleGuidelines = `
STYLE FOCUS:
- Cinematic, visually striking ${lowerStyle} illustration
- Stylized, dramatic lighting and rich atmospheric details
- High-end concept art aesthetic
      `.trim();
    } else {
      targetModel = 'fal-ai/flux-pro';
      inferenceSteps = 32;
      guidanceScale = 5.5;
      styleGuidelines = `
STYLE FOCUS:
- Authentic ${lowerStyle} look
- Natural colors and lighting
- Social-media-friendly realism
      `.trim();
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Mistral prompt engineering
    // ─────────────────────────────────────────────────────────────
    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const systemPrompt = `
You are a world-class professional photographer and viral Instagram creative director.

Your task is to generate a complete Instagram post package consisting of:
1. A highly authentic, social-media-optimized image generation prompt
2. An engaging, conversion-optimized Instagram caption
3. A set of relevant and trending hashtags

IMAGE PROMPT RULES (CRITICAL):
- The image MUST be indistinguishable from a real photograph taken by a human.
- Write the prompt describing the exact camera, lighting, framing, and tangible textures.
- Focus intensely on authenticity, real-world lighting, natural colors, and subtle imperfections.
- NEVER use AI-art buzzwords like: "8K", "hyperrealistic", "masterpiece", "ultra-detailed", or "CGI".
- The prompt should read like a set description for a photoshoot.

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure (no markdown wrapper):

{
  "imagePrompt": "string (the highly realistic photographic prompt)",
  "caption": "string",
  "hashtags": "string"
}
    `.trim();

    const userMessage = `
Create an Instagram post package for the following topic:

Topic: "${topic.trim()}"
Style: ${style}
Aspect Ratio: ${aspectRatio}

${styleGuidelines}

Make the image prompt vivid, specific, and optimized for maximum authentic engagement on Instagram.
    `.trim();

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    let aiContent;
    try {
      let contentString = chatResponse.choices[0].message.content.trim();

      // Safety cleanup (in case model wraps JSON)
      if (contentString.startsWith('\`\`\`')) {
        contentString = contentString
          .replace(/^\`\`\`(json)?/i, '')
          .replace(/\`\`\`$/i, '')
          .trim();
      }

      aiContent = JSON.parse(contentString);
    } catch (err) {
      console.error('[AI Image] JSON parse error:', err);
      throw new Error('Failed to parse AI response');
    }

    const enhancedPrompt = aiContent.imagePrompt;

    // ─────────────────────────────────────────────────────────────
    // STEP 3: fal.ai image generation
    // ─────────────────────────────────────────────────────────────
    fal.config({
      credentials: process.env.FAL_AI_API_KEY,
    });

    const sizeMap = {
      '1:1': 'square_hd',
      '16:9': 'landscape_16_9',
      '9:16': 'portrait_16_9',
      '4:3': 'landscape_4_3',
    };

    const imageSize = sizeMap[aspectRatio] || 'square_hd';

    const result = await fal.subscribe(targetModel, {
      input: {
        prompt: enhancedPrompt,
        image_size: imageSize,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: false,
    });

    const imageUrl = result?.data?.images?.[0]?.url;

    if (!imageUrl) {
      console.error('[AI Image] fal.ai response:', result);
      return res.status(502).json({
        success: false,
        message: 'Image generation failed',
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Save image details in Database
    // ─────────────────────────────────────────────────────────────
    let savedImageRecord = null;
    
    // We assume check `protect` middleware populates req.user
    if (req.user && req.user._id) {
      const renderId = `fal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        savedImageRecord = await GeneratedImage.create({
          user: req.user._id,
          prompt: enhancedPrompt,
          renderId: renderId,
          imageUrl: imageUrl,
          status: 'done',
          metadata: {
            aspectRatio: aspectRatio,
            width: result?.data?.images?.[0]?.width || null,
            height: result?.data?.images?.[0]?.height || null
          },
          isActive: true
        });
      } catch (dbErr) {
        console.error('[AI Image] Error saving to database:', dbErr);
        // We will swallow the db error and still return the generated image
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        imageUrl,
        prompt: enhancedPrompt,
        caption: aiContent.caption,
        hashtags: aiContent.hashtags,
        topic: topic.trim(),
        style,
        aspectRatio,
        modelUsed: targetModel,
        imageId: savedImageRecord ? savedImageRecord._id : null
      },
    });
  } catch (err) {
    console.error('[AI Image] Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};
