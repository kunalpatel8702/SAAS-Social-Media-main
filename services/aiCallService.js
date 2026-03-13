const axios = require('axios');

class AICallClient {
  constructor() {
    this.baseUrl = (process.env.VAPI_URL || 'https://api.vapi.ai').replace(/\/call$/, '');
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VAPI_API_KEY is not defined. AI calls will be simulated.');
    }
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Build a white-label, fully personalized system prompt for each call.
   * The same assistant is used for all users — we override the system prompt
   * with user-specific + lead-specific context every time.
   */
  buildSystemPrompt({ senderName, senderCompany, offering, callGoal, painPoint, specialOffer, companyProfile, leadCompanyName }) {
    const goalGuide = {
      BOOK_MEETING: 'Your ONLY goal is to book a 10-15 minute discovery call. Focus everything on getting a calendar slot.',
      QUALIFY_LEAD: 'Your ONLY goal is to qualify the prospect. Ask 2-3 short questions to see if they are a fit.',
      INTRODUCE: 'Your ONLY goal is to introduce the company and leave a positive impression. Do not push for a meeting.',
    }[callGoal] || 'Book a brief discovery call.';

    const researchContext = companyProfile
      ? `RESEARCH ON THEIR BUSINESS:\n- They specialize in: ${companyProfile.coreOffering}\n- Their audience: ${companyProfile.targetAudience}\n- Unique angle: ${companyProfile.uniqueAngle}`
      : `You are calling ${leadCompanyName}. Research was not available for this business.`;

    const offerLine = specialOffer
      ? `SPECIAL OFFER TO MENTION (weave in naturally, do not open with it): ${specialOffer}`
      : '';

    return `You are an expert outbound sales development representative (SDR) calling on behalf of ${senderCompany}.
Your name for this call is ${senderName || 'an assistant'}.

## Your Company
${senderCompany} offers: ${offering}

## The Lead You Are Calling
${researchContext}

## Campaign Goal
${goalGuide}

${offerLine}

## Rules of Engagement
1. Be concise — max 1-2 sentences per turn. Phone calls demand brevity.
2. Sound human. Use natural transitions: "Gotcha", "Right", "That makes sense."
3. NEVER mention you are an AI unless directly and persistently asked.
4. If busy: "Completely understand, I caught you out of the blue. Is there a better time next week for a 5-minute chat?"
5. Always end your turn with a question to keep the conversation moving.
6. Do not make up pricing or features. Say: "Our team can walk you through that on the discovery call."

## Objection Handling
- "Not interested": "Fair enough. Most of our best clients said the same thing before we showed them how we handle ${painPoint || 'the challenge'}. Could I get just 5 minutes next week?"
- "Send an email": "Happy to. Just so I send the relevant info — is ${painPoint || 'this area'} something you're actively trying to solve right now?"
- "Already have a solution": "That's great — we actually work alongside most existing tools. How's your current setup performing on ${painPoint || 'this'}?"

## Call Structure
1. **Intro**: "Hi, is this the ${leadCompanyName} team? Hey — this is ${senderName || 'calling'} from ${senderCompany}. I know I've caught you mid-day, do you have just a brief moment?"
2. **Pitch**: "The reason I'm reaching out — we help companies like yours with ${offering}. I was curious, are you currently doing anything about ${painPoint || 'this area'}?"
3. **Qualify**: Ask 1-2 short questions based on their response.
4. **Close**: "Based on what you've shared, it sounds like it could be worth a quick 10-minute conversation. Do you have any time next week?"`;
  }

  /**
   * Build a personalized first message for each lead.
   */
  buildFirstMessage({ senderName, senderCompany, leadCompanyName }) {
    return `Hi, is this the ${leadCompanyName || 'team'}? Hey — this is ${senderName || 'calling'} from ${senderCompany || 'our company'}. I know I've caught you in the middle of your day — do you have just a brief moment?`;
  }

  /**
   * Initiate an outbound AI call via VAPI with full white-label personalization.
   */
  async initiateCall(payload) {
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!phoneNumberId) throw new Error('VAPI_PHONE_NUMBER_ID is missing from .env');
    if (!assistantId) throw new Error('VAPI_ASSISTANT_ID is missing from .env');

    if (!process.env.VAPI_API_KEY) {
      // Simulate call for dev/test
      console.warn('[AICallClient] Simulating call — VAPI_API_KEY not set.');
      console.log(`  → To: ${payload.phone} (${payload.companyName})`);
      console.log(`  → Sender: ${payload.aiCallConfig?.senderName} @ ${payload.aiCallConfig?.senderCompany}`);
      return { callId: `simulated-${Date.now()}` };
    }

    const cfg = payload.aiCallConfig || {};

    // Build personalized prompt + first message
    const systemPrompt = this.buildSystemPrompt({
      senderName: cfg.senderName || 'Your assistant',
      senderCompany: cfg.senderCompany || 'Our Company',
      offering: cfg.offering || 'our services',
      callGoal: cfg.callGoal || 'BOOK_MEETING',
      painPoint: cfg.painPoint || '',
      specialOffer: cfg.specialOffer || '',
      companyProfile: payload.companyProfile || null,
      leadCompanyName: payload.companyName || 'your company',
    });

    const firstMessage = this.buildFirstMessage({
      senderName: cfg.senderName || 'Your assistant',
      senderCompany: cfg.senderCompany || 'Our Company',
      leadCompanyName: payload.companyName || 'there',
    });

    const requestBody = {
      assistantId,
      phoneNumberId,
      customer: {
        number: this.formatPhoneNumber(payload.phone),
        name: payload.contactName || payload.companyName || 'Customer',
      },
      assistantOverrides: {
        firstMessage,
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }],
        },
      },
      ...(payload.metadata && { metadata: payload.metadata }),
    };

    try {
      const response = await this.axiosInstance.post('/call/phone', requestBody);
      const callId = response.data?.id || response.data?.callId;
      if (!callId) throw new Error('Invalid VAPI response: missing call ID');
      return { callId };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data ? JSON.stringify(error.response.data) : 'No details';
      throw new Error(`VAPI call failed: ${msg} | ${details}`);
    }
  }

  /**
   * Formats a raw phone string into E.164 (+91XXXXXXXXXX etc.)
   * Handles Indian numbers (10 digits → +91...) and US (10 digits → +1...).
   */
  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/(?!^\+)[^\d]/g, '');

    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        // Assume Indian number if starts with 6-9
        const firstDigit = parseInt(cleaned[0]);
        cleaned = firstDigit >= 6 ? '+91' + cleaned : '+1' + cleaned;
      } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }
}

module.exports = new AICallClient();
