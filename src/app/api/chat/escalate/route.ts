import { NextRequest, NextResponse } from 'next/server';
import { escalateToHuman, addMessage } from '@/lib/database-prisma';

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Mark chat as escalated
    await escalateToHuman(chatId);

    // Add system message about escalation
    await addMessage(
      chatId,
      'This conversation has been escalated to a human advisor. An admissions counselor will join the chat shortly.',
      'bot',
      'system'
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Escalate chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
