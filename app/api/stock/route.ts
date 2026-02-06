import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StockReservation from '@/models/StockReservation';
import SellerProduct from '@/models/SellerProduct';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, items } = await req.json();
    
    const reservations = [];
    
    for (const item of items) {
      const product = await SellerProduct.findById(item.sellerProductId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for product ${item.sellerProductId}` 
        }, { status: 400 });
      }
      
      // Reserve stock for 15 minutes
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      const reservation = await StockReservation.create({
        userId,
        sellerProductId: item.sellerProductId,
        quantity: item.quantity,
        expiresAt
      });
      
      // Deduct from available stock
      product.stock -= item.quantity;
      await product.save();
      
      reservations.push(reservation);
    }
    
    return NextResponse.json({ success: true, reservations, expiresAt: reservations[0].expiresAt });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reserve stock' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, status, orderId } = await req.json();
    
    const reservations = await StockReservation.find({ userId, status: 'active' });
    
    for (const reservation of reservations) {
      if (status === 'completed') {
        reservation.status = 'completed';
        reservation.orderId = orderId;
      } else if (status === 'cancelled') {
        // Return stock
        await SellerProduct.findByIdAndUpdate(
          reservation.sellerProductId,
          { $inc: { stock: reservation.quantity } }
        );
        reservation.status = 'cancelled';
      }
      await reservation.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reservations' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    
    // Clean up expired reservations
    const expired = await StockReservation.find({
      status: 'active',
      expiresAt: { $lt: new Date() }
    });
    
    for (const reservation of expired) {
      // Return stock
      await SellerProduct.findByIdAndUpdate(
        reservation.sellerProductId,
        { $inc: { stock: reservation.quantity } }
      );
      reservation.status = 'expired';
      await reservation.save();
    }
    
    return NextResponse.json({ success: true, cleaned: expired.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clean reservations' }, { status: 500 });
  }
}
