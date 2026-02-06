import mongoose from 'mongoose';

const LoyaltyProgramSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Points
  totalPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  redeemedPoints: { type: Number, default: 0 },
  
  // Tier
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    default: 'bronze' 
  },
  tierProgress: { type: Number, default: 0 }, // % to next tier
  
  // Stats
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  
  // Rewards
  rewards: [{
    type: { type: String, enum: ['discount', 'cashback', 'freebie'] },
    value: Number,
    description: String,
    expiresAt: Date,
    isUsed: { type: Boolean, default: false },
    usedAt: Date
  }],
  
  // Referrals
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
}, { timestamps: true });

// Auto-calculate tier
LoyaltyProgramSchema.methods.calculateTier = function() {
  if (this.totalSpent >= 50000) this.tier = 'platinum';
  else if (this.totalSpent >= 25000) this.tier = 'gold';
  else if (this.totalSpent >= 10000) this.tier = 'silver';
  else this.tier = 'bronze';
  
  const tierLimits: any = { bronze: 10000, silver: 25000, gold: 50000, platinum: 100000 };
  const nextLimit = tierLimits[this.tier];
  this.tierProgress = (this.totalSpent / nextLimit) * 100;
};

export default mongoose.models.LoyaltyProgram || mongoose.model('LoyaltyProgram', LoyaltyProgramSchema);
