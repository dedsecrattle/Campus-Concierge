import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addAdminIntervention } from '@/lib/database-prisma';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID and message are required' },
        { status: 400 }
      );
    }

    // Only add admin intervention to database (not to messages table)
    // The getMessagesByChat function will convert interventions to message format
    const interventionId = uuidv4();
    await addAdminIntervention(interventionId, chatId, message);

    // Emit real-time admin intervention via Socket.IO
    const io = (global as any).io;
    if (io) {
      io.to(chatId).emit('admin-intervention', {
        chatId,
        message: {
          id: interventionId,
          content: message,
          sender: 'admin',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin intervention error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
