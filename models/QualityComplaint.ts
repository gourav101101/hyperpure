import mongoose from 'mongoose';

const QualityComplaintSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Complaint
  issueType: { 
    type: String, 
    enum: ['damaged', 'expired', 'wrong_item', 'poor_quality', 'missing', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  images: [String],
  
  // Resolution
  status: { 
    type: String, 
    enum: ['pending', 'investigating', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  resolution: String,
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['pending', 'processed', 'rejected'], default: 'pending' },
  
  // Penalty
  penaltyApplied: { type: Boolean, default: false },
  penaltyAmount: { type: Number, default: 0 },
  penaltyReason: String,
  
  // Admin
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  adminNotes: String,
  
}, { timestamps: true });

QualityComplaintSchema.index({ sellerId: 1, status: 1 });

export default mongoose.models.QualityComplaint || mongoose.model('QualityComplaint', QualityComplaintSchema);
