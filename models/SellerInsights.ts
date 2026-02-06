import mongoose from 'mongoose';

const SellerInsightsSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  date: { type: Date, required: true },
  
  // Sales Analytics
  sales: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    peakHour: String, // "18:00-19:00"
    topProducts: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number, revenue: Number }]
  },
  
  // Profit Analysis
  profit: {
    grossProfit: { type: Number, default: 0 },
    commissionPaid: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 } // percentage
  },
  
  // Customer Insights
  customers: {
    totalCustomers: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    repeatRate: { type: Number, default: 0 }, // percentage
    topCustomers: [{ userId: mongoose.Schema.Types.ObjectId, orders: Number, revenue: Number }]
  },
  
  // Competitive Analysis
  competition: {
    marketShare: { type: Number, default: 0 }, // percentage
    priceRank: { type: Number, default: 0 },
    ratingRank: { type: Number, default: 0 },
    totalCompetitors: { type: Number, default: 0 }
  },
  
  // Predictions
  forecast: {
    nextPeriodRevenue: { type: Number, default: 0 },
    growthRate: { type: Number, default: 0 }, // percentage
    confidence: { type: Number, default: 0 }, // 0-100
    risks: [String],
    opportunities: [String]
  },
  
  // Recommendations
  recommendations: [{
    type: { type: String, enum: ['pricing', 'inventory', 'marketing', 'quality'] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    message: String,
    impact: String, // "Increase revenue by 15%"
    action: String
  }]
  
}, { timestamps: true });

SellerInsightsSchema.index({ sellerId: 1, period: 1, date: -1 });

export default mongoose.models.SellerInsights || mongoose.model('SellerInsights', SellerInsightsSchema);
