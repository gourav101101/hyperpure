import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, startDate, endDate } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await Order.find({
      userId: user._id,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ createdAt: -1 });

    // Generate CSV content
    let csv = 'Date,Order ID,Amount,Status,Items\n';
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const items = order.items.map((i: any) => i.name).join('; ');
      csv += `${date},${order._id},${order.totalAmount},${order.status},"${items}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="statement-${startDate}-${endDate}.csv"`
      }
    });
  } catch (error) {
    console.error('Statement generation error:', error);
    return NextResponse.json({ error: 'Failed to generate statement' }, { status: 500 });
  }
}
