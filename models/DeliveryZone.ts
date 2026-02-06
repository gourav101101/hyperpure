import mongoose from 'mongoose';

const DeliveryZoneSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  
  // Location
  city: { type: String, required: true },
  areas: [String], // Array of area names
  pincodes: [String], // Array of pincodes
  
  // Coordinates (for distance calculation)
  latitude: Number,
  longitude: Number,
  
  // Delivery Settings
  maxDeliveryDistance: { type: Number, default: 10 }, // in km
  avgDeliveryTime: { type: Number, default: 24 }, // in hours
  deliveryDays: [String], // ['Monday', 'Tuesday', ...]
  
  // Capacity
  maxOrdersPerDay: { type: Number, default: 50 },
  currentOrdersToday: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true }
  
}, { timestamps: true });

DeliveryZoneSchema.index({ sellerId: 1, city: 1 });
DeliveryZoneSchema.index({ pincodes: 1 });

export default mongoose.models.DeliveryZone || mongoose.model('DeliveryZone', DeliveryZoneSchema);
