import { NextRequest, NextResponse } from 'next/server';
import { findActiveChatByEmail, getChatsBySessionEmail } from '@/lib/database-prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check for existing chats with message counts
    const existingChats = await getChatsBySessionEmail(email);
    const activeChat = await findActiveChatByEmail(email);

    // Add message counts to existing chats (simulated for now)
    const chatsWithCounts = existingChats.map(chat => ({
      ...chat,
      _count: {
        messages: 0 // This would be populated by a proper query
      }
    }));

    return NextResponse.json({
      hasExistingChats: existingChats.length > 0,
      existingChats: chatsWithCounts,
      activeChat,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
