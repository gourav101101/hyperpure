import mongoose from 'mongoose';

const SellerProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerPrice: { type: Number, required: true },
  unitValue: { type: Number, required: true },
  unitMeasure: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  minOrderQty: { type: Number, default: 1 },
  maxOrderQty: { type: Number },
  deliveryTime: { type: String, default: '24 hours' },
  discount: { type: Number, default: 0 }
}, { timestamps: true });

SellerProductSchema.index({ sellerId: 1, productId: 1, unitValue: 1, unitMeasure: 1 });

export default mongoose.models.SellerProduct || mongoose.model('SellerProduct', SellerProductSchema);