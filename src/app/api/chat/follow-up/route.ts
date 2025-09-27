import { NextRequest, NextResponse } from 'next/server';
import { requestFollowUp, addMessage } from '@/lib/database-prisma';

export async function POST(request: NextRequest) {
  try {
    const { chatId, studentName, studentEmail } = await request.json();

    if (!chatId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: 'Chat ID, student name, and email are required' },
        { status: 400 }
      );
    }

    // Mark chat as requesting follow-up
    await requestFollowUp(chatId);

    // Add system message about follow-up request
    await addMessage(
      chatId,
      `Thank you, ${studentName}! We've received your request for a follow-up call. An admissions counselor will contact you at ${studentEmail} within 1-2 business days.`,
      'bot',
      'system'
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Follow-up request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
