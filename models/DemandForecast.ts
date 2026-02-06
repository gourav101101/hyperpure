import mongoose from 'mongoose';

const DemandForecastSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  
  // Historical Data
  historicalSales: [{
    date: Date,
    quantity: Number,
    revenue: Number
  }],
  
  // Forecast
  forecastPeriod: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
  predictions: [{
    date: Date,
    predictedQuantity: Number,
    confidence: Number, // 0-100%
    factors: {
      trend: Number,
      seasonality: Number,
      events: [String]
    }
  }],
  
  // Recommendations
  recommendations: {
    suggestedStock: Number,
    reorderPoint: Number,
    optimalPrice: Number,
    expectedDemand: String // 'high', 'medium', 'low'
  },
  
  // Accuracy
  accuracy: { type: Number, default: 0 }, // %
  lastCalculated: Date,
  
}, { timestamps: true });

DemandForecastSchema.index({ productId: 1, sellerId: 1 });

export default mongoose.models.DemandForecast || mongoose.model('DemandForecast', DemandForecastSchema);
