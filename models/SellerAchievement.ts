import mongoose from 'mongoose';

const SellerAchievementSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  
  // Badges
  badges: [{
    name: { type: String, required: true },
    icon: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    category: { type: String, enum: ['orders', 'quality', 'speed', 'revenue', 'special'] }
  }],
  
  // Achievements
  achievements: {
    firstOrder: { type: Boolean, default: false },
    orders50: { type: Boolean, default: false },
    orders100: { type: Boolean, default: false },
    orders500: { type: Boolean, default: false },
    orders1000: { type: Boolean, default: false },
    perfectWeek: { type: Boolean, default: false }, // 7 days, zero complaints
    speedDemon: { type: Boolean, default: false }, // <2 min response
    qualityKing: { type: Boolean, default: false }, // 100 orders, zero complaints
    volumeMaster: { type: Boolean, default: false }, // 500+ orders/month
    platinumElite: { type: Boolean, default: false } // Top 1%
  },
  
  // Leaderboard Stats
  leaderboard: {
    weeklyRank: { type: Number, default: 0 },
    monthlyRank: { type: Number, default: 0 },
    allTimeRank: { type: Number, default: 0 },
    categoryRank: { type: Number, default: 0 }
  },
  
  // Rewards
  rewards: {
    totalPointsEarned: { type: Number, default: 0 },
    currentPoints: { type: Number, default: 0 },
    bonusEarned: { type: Number, default: 0 },
    featuredSeller: { type: Boolean, default: false },
    featuredUntil: Date
  },
  
  // Challenges
  activeChallenges: [{
    name: String,
    description: String,
    target: Number,
    current: Number,
    reward: String,
    expiresAt: Date,
    completed: { type: Boolean, default: false }
  }],
  
  // Streaks
  streaks: {
    currentStreak: { type: Number, default: 0 }, // Days with at least 1 order
    longestStreak: { type: Number, default: 0 },
    lastOrderDate: Date
  }
  
}, { timestamps: true });

export default mongoose.models.SellerAchievement || mongoose.model('SellerAchievement', SellerAchievementSchema);
