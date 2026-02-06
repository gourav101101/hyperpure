import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['internal', 'dunzo', 'porter', 'shadowfax', 'other'], required: true },
  phone: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'scooter', 'van', 'truck'] },
  vehicleNumber: String,
  
  // Status
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  
  // Zone
  assignedZones: [String],
  
  // Performance
  totalDeliveries: { type: Number, default: 0 },
  completedDeliveries: { type: Number, default: 0 },
  avgDeliveryTime: { type: Number, default: 0 },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  
  // API Integration (for 3rd party)
  apiKey: String,
  apiEndpoint: String,
  
}, { timestamps: true });

export default mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
