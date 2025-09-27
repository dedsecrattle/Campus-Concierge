import { NextRequest, NextResponse } from 'next/server';
import { getAllFollowUps, updateFollowUpStatus } from '@/lib/database-prisma';

export async function GET() {
  try {
    const followUps = await getAllFollowUps();
    return NextResponse.json({ followUps });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { followUpId, status, notes } = await request.json();

    if (!followUpId || !status) {
      return NextResponse.json(
        { error: 'Follow-up ID and status are required' },
        { status: 400 }
      );
    }

    const updatedFollowUp = await updateFollowUpStatus(followUpId, status, notes);
    return NextResponse.json({ followUp: updatedFollowUp });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
