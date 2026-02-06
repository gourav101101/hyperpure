import mongoose from 'mongoose';

const SellerPerformanceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  
  // Performance Metrics
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  
  // Rates (%)
  fulfillmentRate: { type: Number, default: 100 }, // completedOrders / totalOrders * 100
  cancellationRate: { type: Number, default: 0 },
  
  // Delivery Performance
  avgDeliveryTime: { type: Number, default: 0 }, // in hours
  onTimeDeliveryRate: { type: Number, default: 100 },
  
  // Quality Metrics
  qualityScore: { type: Number, default: 5, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Stock Management
  stockAccuracy: { type: Number, default: 100 },
  outOfStockIncidents: { type: Number, default: 0 },
  
  // Financial
  totalRevenue: { type: Number, default: 0 },
  totalCommissionPaid: { type: Number, default: 0 },
  
  // Seller Tier
  tier: { 
    type: String, 
    enum: ['new', 'standard', 'premium'], 
    default: 'new' 
  },
  
  // Response Time
  avgResponseTime: { type: Number, default: 0 }, // in minutes
  
  // Complaints
  totalComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: String,
  
  // Last Updated
  lastOrderDate: Date,
  lastStockUpdate: Date
  
}, { timestamps: true });

// Auto-calculate tier based on performance
SellerPerformanceSchema.methods.calculateTier = function() {
  if (this.totalOrders < 50) {
    this.tier = 'new';
  } else if (this.fulfillmentRate >= 95 && this.cancellationRate <= 2 && this.qualityScore >= 4.5) {
    this.tier = 'premium';
  } else if (this.fulfillmentRate >= 85) {
    this.tier = 'standard';
  } else {
    this.tier = 'new';
  }
  return this.tier;
};

export default mongoose.models.SellerPerformance || mongoose.model('SellerPerformance', SellerPerformanceSchema);
