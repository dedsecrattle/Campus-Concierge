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

If you encounter questions that are:
- Too complex or specific for general information
- Require personalized advice
- About sensitive topics (financial situations, special circumstances)
- Technical issues with applications

Suggest escalating to a human by saying something like: "This is a great question that would be best answered by one of our admissions counselors. Would you like me to connect you with a human advisor?"

For follow-up calls, you can say: "I'd be happy to help you schedule a call with an admissions counselor. Could you please provide your name and email address?"`;

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

// Function to determine if a message should escalate to human
export const shouldEscalateToHuman = (userMessage: string, botResponse: string): boolean => {
  const escalationKeywords = [
    'connect you with a human',
    'admissions counselor',
    'human advisor',
    'speak to someone',
    'talk to a person'
  ];

  return escalationKeywords.some(keyword => 
    botResponse.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Function to determine if user wants to book a follow-up call
export const wantsFollowUpCall = (userMessage: string, botResponse: string): boolean => {
  const followUpKeywords = [
    'schedule a call',
    'book a call',
    'follow-up call',
    'name and email',
    'contact information'
  ];

  return followUpKeywords.some(keyword => 
    botResponse.toLowerCase().includes(keyword.toLowerCase())
  );
};
