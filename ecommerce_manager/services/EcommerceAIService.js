const Groq = require('groq-sdk');

class EcommerceAIService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn('[eCommerce AI] GROQ_API_KEY not set – AI generation will fail.');
        }
        this.client = new Groq({ apiKey: apiKey || 'dummy' });
        this.model = 'llama-3.3-70b-versatile';
    }

    // ─────────────────────────────────────────────────
    // 1. Product Description Generator
    // ─────────────────────────────────────────────────
    async generateProductDescription({ name, category, features, brandVoice }) {
        const prompt = `You are an elite eCommerce copywriter and SEO strategist.
Write a high-converting, SEO-optimized product description.

Product Name: ${name}
Category: ${category}
Key Features: ${Array.isArray(features) ? features.join(', ') : features}
Brand Voice: ${brandVoice || 'Professional'}

Structure your response as:
1. A catchy H1 product title (SEO-friendly)
2. A compelling opening paragraph (3-4 sentences)
3. A "Key Benefits" section with bullet points
4. A "Why Choose Us" closing section
5. 3-5 SEO keywords

Respond ONLY in JSON:
{
  "title": "...",
  "description": "...",
  "benefits": ["...", "..."],
  "whyChooseUs": "...",
  "keywords": ["...", "..."]
}`;

        return this._generate(prompt, 'Product Description');
    }

    // ─────────────────────────────────────────────────
    // 2. Landing Page Generator
    // ─────────────────────────────────────────────────
    async generateLandingPage({ productName, productDescription, targetAudience, goal }) {
        const prompt = `Generate a complete high-converting sales landing page copy.

Product: ${productName}
About: ${productDescription}
Target Audience: ${targetAudience || 'General consumers'}
Goal: ${goal || 'Increase conversions'}

Include sections:
1. Hero: headline, subheadline, CTA button text
2. Benefits: 3 benefits with title + description
3. Features: 3 features with title + description
4. Testimonials: 2 realistic testimonials (name + quote)
5. Final CTA: title + button text

Respond ONLY in JSON:
{
  "hero": { "headline": "...", "subheadline": "...", "cta": "..." },
  "benefits": [{ "title": "...", "description": "..." }],
  "features": [{ "title": "...", "description": "..." }],
  "testimonials": [{ "author": "...", "text": "..." }],
  "finalCTA": { "title": "...", "buttonText": "..." }
}`;

        return this._generate(prompt, 'Landing Page');
    }

    // ─────────────────────────────────────────────────
    // 3. Marketing Copy Generator
    // ─────────────────────────────────────────────────
    async generateMarketingCopy({ type, productInfo, campaignGoal, targetAudience }) {
        const prompt = `You are a world-class marketing copywriter.
Generate ${type} marketing copy for an eCommerce product.

Product Info: ${productInfo}
Campaign Goal: ${campaignGoal}
Target Audience: ${targetAudience || 'Online shoppers'}
Type: ${type}

Rules:
- If type is "email": write subject line + full email body
- If type is "facebook-ad" or "instagram-post": write headline, body, CTA
- If type is "product-launch": write announcement post with excitement
- If type is "social-caption": write a short, engaging caption with hashtags

Respond ONLY in JSON:
{
  "headline": "...",
  "body": "...",
  "cta": "...",
  "hashtags": ["...", "..."]
}`;

        return this._generate(prompt, 'Marketing Copy');
    }

    // ─────────────────────────────────────────────────
    // 4. Customer Support Response
    // ─────────────────────────────────────────────────
    async generateSupportResponse({ message, storeContext }) {
        const prompt = `You are a friendly, professional customer support agent for an online store.

Store policies:
- Shipping: ${storeContext.shippingInfo || 'Standard 5-7 business days'}
- Returns: ${storeContext.returnPolicy || '30-day return policy'}
- Support Email: ${storeContext.supportEmail || 'support@store.com'}

Customer message: "${message}"

Respond helpfully and concisely. If you don't know specific order details, ask the customer for their order number.

Respond ONLY in JSON:
{
  "response": "...",
  "category": "product-inquiry|shipping|returns|order-tracking|general",
  "requiresHuman": false
}`;

        return this._generate(prompt, 'Support Response');
    }

    // ─────────────────────────────────────────────────
    // 5. Store Optimization Suggestions
    // ─────────────────────────────────────────────────
    async getStoreOptimization({ name, niche, brandVoice, industry, productSample }) {
        const prompt = `You are a senior eCommerce conversion rate optimization consultant.
Analyze this store and provide 5 actionable suggestions.

Store: ${name}
Niche: ${niche || 'General'}
Brand Voice: ${brandVoice || 'Professional'}
Industry: ${industry || 'Retail'}
Sample Product Titles: ${productSample || 'Not provided'}

Focus on: product titles, CTAs, benefit copy, trust signals, conversion rate.

Respond ONLY in JSON:
{
  "optimizations": [
    { "area": "...", "suggestion": "...", "priority": "High|Medium|Low", "reason": "..." }
  ]
}`;

        return this._generate(prompt, 'Store Optimization');
    }

    // ─────────────────────────────────────────────────
    // 6. Review Analyzer
    // ─────────────────────────────────────────────────
    async analyzeReviews(reviews) {
        const reviewText = reviews
            .map(r => `Rating: ${r.rating}/5 | Comment: ${r.comment}`)
            .join('\n---\n');

        const prompt = `Analyze the following customer reviews for an eCommerce product.

Reviews:
${reviewText}

Provide:
1. Overall sentiment (Positive / Neutral / Negative)
2. Sentiment score (0.0 to 1.0)
3. Common complaints
4. Praises / strengths
5. Improvement suggestions
6. One-paragraph summary

Respond ONLY in JSON:
{
  "overallSentiment": "Positive|Neutral|Negative",
  "sentimentScore": 0.0,
  "commonComplaints": ["..."],
  "praises": ["..."],
  "improvementSuggestions": ["..."],
  "summary": "..."
}`;

        return this._generate(prompt, 'Review Analysis');
    }

    // ─────────────────────────────────────────────────
    // 7. Sales Insights Generator
    // ─────────────────────────────────────────────────
    async generateSalesInsights({ totalProducts, totalReviews, avgRating, topProductNames }) {
        const prompt = `You are a senior eCommerce data analyst. Based on this store data, generate 5 actionable business insights.

Store Metrics:
- Total Products: ${totalProducts}
- Total Reviews: ${totalReviews}
- Average Rating: ${avgRating}/5
- Top Products: ${topProductNames?.join(', ') || 'N/A'}

Provide insights on: top performers, customer sentiment trends, conversion optimization, inventory.

Respond ONLY in JSON:
{
  "insights": ["...", "..."],
  "keyMetric": "...",
  "recommendation": "..."
}`;

        return this._generate(prompt, 'Sales Insights');
    }

    // ─────────────────────────────────────────────────
    // Internal helper
    // ─────────────────────────────────────────────────
    async _generate(prompt, label) {
        try {
            const completion = await this.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            let raw = completion.choices[0]?.message?.content;
            if (!raw) throw new Error('Empty AI response');

            // Robust JSON extraction in case of markdown bloat
            try {
                return JSON.parse(raw);
            } catch (pErr) {
                const jsonMatch = raw.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                throw pErr;
            }
        } catch (error) {
            console.error(`[eCommerce AI] ${label} generation failed:`, error.message);
            throw error;
        }
    }
}

module.exports = new EcommerceAIService();
