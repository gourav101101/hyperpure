import mongoose from 'mongoose';

const DeliverySlotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slotType: { type: String, enum: ['standard', 'express'], default: 'standard' },
  
  // For standard slots
  orderCutoffTime: { type: String, default: '23:00' },
  deliveryStartTime: { type: String, default: '12:00' },
  deliveryEndTime: { type: String, default: '17:00' },
  
  // For express slots
  expressDeliveryHours: { type: Number, default: 2 },
  deliveryCharge: { type: Number, default: 0 },
  express24x7: { type: Boolean, default: false }, // If true, ignore delivery window for express
  
  // Order requirements
  minOrderValue: { type: Number, default: 0 }, // Minimum cart value for this slot
  
  // Availability
  daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday, empty=all days
  
  // Collection times for sellers
  sellerCollectionStart: { type: String, default: '08:00' },
  sellerCollectionEnd: { type: String, default: '12:00' },
  
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }, // Higher priority shows first
  
  // Legacy fields (keep for backward compatibility) - NOT REQUIRED
  deliveryDate: { type: Date, required: false },
  isExpress: { type: Boolean, default: false },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.DeliverySlot || mongoose.model('DeliverySlot', DeliverySlotSchema);
