import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
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
