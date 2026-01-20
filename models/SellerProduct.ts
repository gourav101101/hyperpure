import mongoose from 'mongoose';

const SellerProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerPrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  minOrderQty: { type: Number, default: 1 },
  deliveryTime: { type: String, default: '24 hours' },
  brand: { type: String },
  manufacturer: { type: String },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  origin: { type: String }
}, { timestamps: true });

SellerProductSchema.index({ sellerId: 1, productId: 1 }, { unique: true });

export default mongoose.models.SellerProduct || mongoose.model('SellerProduct', SellerProductSchema);