import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Stanford University';

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful admissions chatbot for ${schoolName}. Your role is to assist prospective students with information about the university.

You can help with:
- General information about the university (programs, campus life, admissions requirements, etc.)
- Academic programs and departments
- Campus facilities and resources
- Application process and deadlines
- Student life and activities
- Financial aid and scholarships

Guidelines:
1. Be friendly, helpful, and professional
2. Provide accurate information about ${schoolName}
3. If you don't know specific information, be honest about it
4. For complex questions or specific situations, suggest escalating to a human admissions counselor
5. If a student wants to book a follow-up call, offer to collect their contact information
6. Keep responses concise but informative
7. Always maintain a positive and welcoming tone
8. **Use markdown formatting** to make your responses more readable:
   - Use **bold** for important points
   - Use *italics* for emphasis
   - Use bullet points (- or *) for lists
   - Use numbered lists (1. 2. 3.) for steps
   - Use \`code blocks\` for specific terms, requirements, or examples
   - Use > blockquotes for highlighting important information
   - Use ## headings for organizing longer responses

For different types of requests, respond appropriately:

**For IMMEDIATE HELP (escalation)** - when questions are:
- Too complex or urgent for general information
- About technical issues with applications
- Require immediate human intervention
- About sensitive/emergency situations

Suggest escalating by saying: "This is a great question that would be best answered by one of our admissions counselors. Would you like me to connect you with a human advisor?"

**For SCHEDULED CONSULTATIONS (follow-up calls)** - when students want:
- Personalized guidance about their application
- Detailed program information
- To discuss their specific situation in depth
- A scheduled conversation at their convenience

Suggest a follow-up call by saying: "I'd be happy to help you schedule a call with an admissions counselor. Could you please provide your name and email address so we can arrange a consultation?"

**Use specific language:**
- For escalation: "connect you with a human advisor" or "escalate to a human"
- For follow-up: "schedule a call", "book an appointment", "provide your name and email", or "collect your information"`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const getChatbotResponse = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again or contact our admissions office directly.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment, or feel free to contact our admissions office directly for immediate assistance.';
  }
};

// New streaming function for ChatGPT-like experience
export const getChatbotResponseStream = async function* (messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    yield 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment, or feel free to contact our admissions office directly for immediate assistance.';
  }
};

// Enhanced decision engine for escalation vs follow-up
interface DecisionContext {
  userMessage: string;
  botResponse: string;
  conversationLength?: number;
  timeOfDay?: Date;
}

interface DecisionResult {
  action: 'escalate' | 'followup' | 'none';
  confidence: number;
  reason: string;
}

// Urgency indicators in user messages
const urgencyIndicators = [
  'urgent', 'asap', 'immediately', 'right now', 'emergency',
  'deadline', 'due today', 'due tomorrow', 'time sensitive',
  'can\'t wait', 'need help now', 'stuck', 'broken', 'error'
];

// Technical/complex issue indicators
const technicalIndicators = [
  'application error', 'can\'t submit', 'website not working',
  'login problem', 'payment failed', 'document upload',
  'technical issue', 'system error', 'bug', 'glitch'
];

// Consultation/planning indicators
const consultationIndicators = [
  'want to discuss', 'need advice', 'guidance', 'planning',
  'considering', 'thinking about', 'explore options',
  'learn more about', 'tell me about', 'information about'
];

// Escalation phrases in bot responses
const escalationPhrases = [
  'connect you with a human',
  'escalate to a human',
  'speak to a human',
  'talk to a human person',
  'human assistance',
  'transfer to human',
  'immediate help'
];

// Follow-up phrases in bot responses
const followupPhrases = [
  'schedule a call',
  'book a call',
  'book an appointment',
  'schedule an appointment',
  'follow-up call',
  'callback',
  'phone consultation',
  'name and email',
  'contact information',
  'provide your details',
  'collect your information',
  'arrange a consultation'
];

const analyzeUrgency = (userMessage: string): number => {
  const message = userMessage.toLowerCase();
  let urgencyScore = 0;
  
  urgencyIndicators.forEach(indicator => {
    if (message.includes(indicator)) urgencyScore += 2;
  });
  
  technicalIndicators.forEach(indicator => {
    if (message.includes(indicator)) urgencyScore += 3;
  });
  
  return Math.min(urgencyScore, 10); // Cap at 10
};

const analyzeConsultationIntent = (userMessage: string): number => {
  const message = userMessage.toLowerCase();
  let consultationScore = 0;
  
  consultationIndicators.forEach(indicator => {
    if (message.includes(indicator)) consultationScore += 2;
  });
  
  return Math.min(consultationScore, 10); // Cap at 10
};

const isBusinessHours = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Monday-Friday, 9 AM - 5 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
};

export const makeDecision = (context: DecisionContext): DecisionResult => {
  const { userMessage, botResponse, conversationLength = 0, timeOfDay = new Date() } = context;
  
  const botLower = botResponse.toLowerCase();
  
  // Analyze user intent
  const urgencyScore = analyzeUrgency(userMessage);
  const consultationScore = analyzeConsultationIntent(userMessage);
  
  // Check bot response patterns
  const hasEscalationPhrase = escalationPhrases.some(phrase => 
    botLower.includes(phrase.toLowerCase())
  );
  
  const hasFollowupPhrase = followupPhrases.some(phrase => 
    botLower.includes(phrase.toLowerCase())
  );
  
  // Decision logic with confidence scoring
  let decision: DecisionResult = {
    action: 'none',
    confidence: 0,
    reason: 'No clear intent detected'
  };
  
  // High urgency + technical issues = escalation
  if (urgencyScore >= 4 || hasEscalationPhrase) {
    decision = {
      action: 'escalate',
      confidence: Math.min(90, 60 + urgencyScore * 5),
      reason: urgencyScore >= 4 
        ? `High urgency detected (score: ${urgencyScore})`
        : 'Bot suggested immediate human assistance'
    };
  }
  
  // Consultation intent + follow-up phrases = follow-up
  else if ((consultationScore >= 3 || hasFollowupPhrase) && urgencyScore < 3) {
    decision = {
      action: 'followup',
      confidence: Math.min(90, 50 + consultationScore * 6),
      reason: consultationScore >= 3
        ? `Consultation intent detected (score: ${consultationScore})`
        : 'Bot offered to schedule consultation'
    };
  }
  
  // Time-based adjustments
  if (!isBusinessHours(timeOfDay)) {
    if (decision.action === 'escalate' && urgencyScore < 6) {
      decision = {
        action: 'followup',
        confidence: 75,
        reason: 'Outside business hours - converted to follow-up'
      };
    }
  }
  
  // Long conversation bias toward escalation
  if (conversationLength > 10 && decision.action === 'none') {
    decision = {
      action: 'escalate',
      confidence: 60,
      reason: 'Long conversation suggests need for human assistance'
    };
  }
  
  return decision;
};

// Backward compatibility functions
export const shouldEscalateToHuman = (userMessage: string, botResponse: string): boolean => {
  const decision = makeDecision({ userMessage, botResponse });
  return decision.action === 'escalate' && decision.confidence >= 60;
};

export const wantsFollowUpCall = (userMessage: string, botResponse: string): boolean => {
  const decision = makeDecision({ userMessage, botResponse });
  return decision.action === 'followup' && decision.confidence >= 60;
};
