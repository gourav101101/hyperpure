import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  
  // Payout Period
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  weekNumber: Number,
  
  // Orders included
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  totalOrders: { type: Number, default: 0 },
  
  // Financial Breakdown
  grossRevenue: { type: Number, default: 0 }, // Total order value
  platformCommission: { type: Number, default: 0 }, // Commission deducted
  deliveryFeeShare: { type: Number, default: 0 }, // If seller gets delivery fee share
  adjustments: { type: Number, default: 0 }, // Penalties/bonuses
  netPayout: { type: Number, default: 0 }, // Final amount to seller
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'on_hold'], 
    default: 'pending' 
  },
  
  // Payment Details
  paymentMethod: { type: String, enum: ['bank_transfer', 'upi', 'wallet'], default: 'bank_transfer' },
  transactionId: String,
  paidAt: Date,
  
  // Bank Details (snapshot at payout time)
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  
  // Notes
  notes: String,
  failureReason: String
  
}, { timestamps: true });

PayoutSchema.index({ sellerId: 1, periodStart: 1 });

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
