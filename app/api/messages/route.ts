import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    
    if (conversationId) {
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();
      return NextResponse.json({ messages });
    }
    
    if (userId) {
      // Get all conversations for user
      const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } }
      ]);
      return NextResponse.json({ conversations });
    }
    
    return NextResponse.json({ error: 'conversationId or userId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Generate conversationId if not provided
    if (!body.conversationId) {
      const ids = [body.senderId, body.receiverId].sort();
      body.conversationId = `${ids[0]}_${ids[1]}`;
    }
    
    const message = await Message.create(body);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { messageId, isRead } = await req.json();
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead, readAt: isRead ? new Date() : null },
      { new: true }
    );
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
