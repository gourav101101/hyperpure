import mongoose from 'mongoose';

const SellerZoneSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "North Delhi"
  city: { type: String, required: true },
  
  // Coverage
  pincodes: [String],
  coordinates: {
    center: { latitude: Number, longitude: Number },
    radius: Number // in km
  },
  
  // Sellers
  sellers: [{
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    isPrimary: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now }
  }],
  
  // Zone Leader
  zoneLeader: {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    appointedAt: Date,
    bonus: { type: Number, default: 10000 } // Monthly bonus
  },
  
  // Performance
  stats: {
    totalOrders: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 0 }, // in minutes
    demandLevel: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'medium' },
    activeSellers: { type: Number, default: 0 }
  },
  
  // Pricing
  zonePricing: {
    enabled: { type: Boolean, default: false },
    priceMultiplier: { type: Number, default: 1.0 }, // 1.05 = 5% premium
    deliveryFee: { type: Number, default: 30 }
  },
  
  isActive: { type: Boolean, default: true }
  
}, { timestamps: true });

export default mongoose.models.SellerZone || mongoose.model('SellerZone', SellerZoneSchema);
