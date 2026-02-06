import mongoose from 'mongoose';

const TierCommissionSchema = new mongoose.Schema({
  tier: { 
    type: String, 
    enum: ['new', 'standard', 'premium'], 
    required: true,
    unique: true 
  },
  commissionRate: { type: Number, required: true },
  minOrders: { type: Number, default: 0 },
  minRevenue: { type: Number, default: 0 },
  benefits: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.TierCommission || mongoose.model('TierCommission', TierCommissionSchema);
