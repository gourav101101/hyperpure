import mongoose from 'mongoose';

const CommissionSchema = new mongoose.Schema({
  commissionRate: { type: Number, default: 10 },
  deliveryFee: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  // Tier-based commission (if enabled)
  useTierCommission: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);
