import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import SellerPerformance from '@/models/SellerPerformance';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const sellerId = searchParams.get('sellerId');
    
    const query: any = { isVisible: true };
    if (productId) query.productId = productId;
    if (sellerId) query.sellerId = sellerId;
    
    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Calculate average rating and breakdown
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum: number, r: any) => sum + r.overallRating, 0) / reviews.length 
      : 0;
    
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const rating = Math.round(r.overallRating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++;
      }
    });
    
    return NextResponse.json({ reviews, avgRating, breakdown, total: reviews.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const overallRating = (
      body.productRating + body.deliveryRating + body.qualityRating
    ) / 3;
    
    const review = await Review.create({
      ...body,
      overallRating: Math.round(overallRating * 10) / 10
    });
    
    // Update seller performance
    const performance = await SellerPerformance.findOne({ sellerId: body.sellerId });
    if (performance) {
      const allReviews = await Review.find({ sellerId: body.sellerId });
      const avgQuality = allReviews.reduce((sum, r: any) => sum + r.overallRating, 0) / allReviews.length;
      
      performance.qualityScore = avgQuality;
      performance.totalRatings = allReviews.length;
      performance.totalReviews = allReviews.filter((r: any) => r.comment).length;
      performance.calculateTier();
      await performance.save();
    }
    
    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
