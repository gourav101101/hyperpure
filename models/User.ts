import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, sparse: true, unique: true },
  name: { type: String },
  phoneNumber: { type: String, sparse: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  orderCount: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  otp: { type: String },
  otpExpiresAt: { type: Date }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
