import { NextResponse } from 'next/server';
import { getAllChats } from '@/lib/database-prisma';

export async function GET() {
  try {
    const chats = await getAllChats();
    
    // Group chats by session email and add user identification
    const chatsWithUserInfo = chats.map(chat => ({
      ...chat,
      userIdentifier: chat.sessionEmail || chat.studentEmail || 'Anonymous',
      isReturningUser: !!chat.sessionEmail,
      userType: chat.sessionEmail ? 'Registered' : (chat.studentEmail ? 'Follow-up' : 'Anonymous')
    }));

    // Sort by user email first, then by creation date
    const sortedChats = chatsWithUserInfo.sort((a, b) => {
      // First sort by user identifier
      const userCompare = (a.userIdentifier || '').localeCompare(b.userIdentifier || '');
      if (userCompare !== 0) return userCompare;
      
      // Then by creation date (newest first within same user)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ chats: sortedChats });
  } catch (error) {
    console.error('Get all chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
