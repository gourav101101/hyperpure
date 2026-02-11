import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    await dbConnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully',
      hasUri: !!process.env.MONGODB_URI
    });
  } catch (error: any) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hasUri: !!process.env.MONGODB_URI
    }, { status: 500 });
  }
}
