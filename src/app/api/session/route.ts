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

    return NextResponse.json({
      hasExistingChats: existingChats.length > 0,
      existingChats: existingChats,
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
