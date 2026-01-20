import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  orderCount: { type: Number, default: 0 }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
