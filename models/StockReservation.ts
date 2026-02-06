import mongoose from 'mongoose';

const StockReservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProduct', required: true },
  quantity: { type: Number, required: true },
  
  // Expiry
  expiresAt: { type: Date, required: true, index: true },
  
  // Status
  status: { type: String, enum: ['active', 'completed', 'expired', 'cancelled'], default: 'active' },
  
  // Order
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
}, { timestamps: true });

StockReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.StockReservation || mongoose.model('StockReservation', StockReservationSchema);
