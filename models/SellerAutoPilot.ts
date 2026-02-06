import mongoose from 'mongoose';

const SellerAutoPilotSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  
  // Auto-Accept Settings
  autoAccept: {
    enabled: { type: Boolean, default: false },
    maxOrderValue: { type: Number, default: 5000 },
    minOrderValue: { type: Number, default: 0 },
    autoAcceptBulk: { type: Boolean, default: false },
    blacklistedCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Auto-Pricing Settings
  autoPricing: {
    enabled: { type: Boolean, default: false },
    strategy: { type: String, enum: ['match_lowest', 'stay_above', 'premium', 'custom'], default: 'match_lowest' },
    priceOffset: { type: Number, default: 0 }, // +2 or -2 from competitor
    surgePricing: { type: Boolean, default: false },
    surgeMultiplier: { type: Number, default: 1.1 }, // 10% surge
    clearancePricing: { type: Boolean, default: true },
    clearanceDiscount: { type: Number, default: 20 } // 20% off expiring items
  },
  
  // Auto-Stock Management
  autoStock: {
    enabled: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 20 }, // 20% of max stock
    autoDisableOutOfStock: { type: Boolean, default: true },
    autoEnableOnRestock: { type: Boolean, default: true },
    reorderAlerts: { type: Boolean, default: true }
  },
  
  // Auto-Responses
  autoResponses: {
    enabled: { type: Boolean, default: false },
    orderAccepted: { type: String, default: 'Thank you! Your order is being prepared.' },
    orderReady: { type: String, default: 'Your order is ready for pickup!' },
    orderDelivered: { type: String, default: 'Order delivered. Thank you for choosing us!' },
    customMessages: [{ trigger: String, message: String }]
  },
  
  // Schedule
  operatingHours: {
    enabled: { type: Boolean, default: false },
    schedule: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: String, // "09:00"
      endTime: String // "21:00"
    }]
  },
  
  // Statistics
  stats: {
    ordersAutoAccepted: { type: Number, default: 0 },
    priceAdjustments: { type: Number, default: 0 },
    stockAdjustments: { type: Number, default: 0 },
    timeSaved: { type: Number, default: 0 } // in minutes
  },
  
  isActive: { type: Boolean, default: true }
  
}, { timestamps: true });

export default mongoose.models.SellerAutoPilot || mongoose.model('SellerAutoPilot', SellerAutoPilotSchema);
