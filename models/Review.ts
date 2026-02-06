import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  
  // Ratings (1-5)
  productRating: { type: Number, required: true, min: 1, max: 5 },
  deliveryRating: { type: Number, required: true, min: 1, max: 5 },
  qualityRating: { type: Number, required: true, min: 1, max: 5 },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  
  // Review
  comment: { type: String, maxlength: 500 },
  images: [String],
  
  // Helpful votes
  helpfulCount: { type: Number, default: 0 },
  
  // Status
  isVerified: { type: Boolean, default: true }, // Verified purchase
  isVisible: { type: Boolean, default: true },
  
  // Response
  sellerResponse: String,
  sellerResponseDate: Date,
  
}, { timestamps: true });

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ sellerId: 1, overallRating: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
