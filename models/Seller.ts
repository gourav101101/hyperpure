import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  businessName: { type: String },
  businessType: { type: String, enum: ['manufacturer', 'distributor'], required: true },
  brandNames: { type: String },
  category: { type: String },
  cities: { type: String },
  horecaClients: { type: String },
  catalogueUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  isActive: { type: Boolean, default: true },
  totalProducts: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema);