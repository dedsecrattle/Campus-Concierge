import { NextRequest, NextResponse } from 'next/server';
import { getFollowUpsByChat } from '@/lib/database-prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const followUps = await getFollowUpsByChat(chatId);
    return NextResponse.json({ followUps });
  } catch (error) {
    console.error('Error fetching chat follow-ups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
