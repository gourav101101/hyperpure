import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  phoneNumber: { type: String, required: true },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProduct' },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    unit: { type: String },
    
    // Commission breakdown per item
    sellerPrice: { type: Number }, // Price seller gets
    commissionAmount: { type: Number }, // Platform commission
    commissionRate: { type: Number }, // % commission applied
    gstRate: { type: Number, default: 0 },
    cessRate: { type: Number, default: 0 }
  }],
  
  // Financial Summary
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 30 },
  slotDeliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  totalCommission: { type: Number, default: 0 }, // Total platform commission
  totalSellerPayout: { type: Number, default: 0 }, // Total to be paid to sellers
  
  // Order Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'assigned', 'processing', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  
  // Seller Assignment (for multi-seller orders)
  assignedSellers: [{
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    items: [{ type: mongoose.Schema.Types.ObjectId }], // Item IDs from items array
    status: { type: String, enum: ['assigned', 'accepted', 'rejected', 'completed'], default: 'assigned' },
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    completedAt: Date
  }],
  
  // Delivery Info
  deliverySlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliverySlot' },
  deliverySlotName: { type: String },
  deliveryTime: { type: String },
  deliveryAddress: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    latitude: Number,
    longitude: Number
  },
  
  // Delivery Tracking
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  deliveryStatus: { type: String, enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'], default: 'pending' },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryProof: String, // Image URL
  
  // Payment
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  
  // Payout Hold System (24hr after delivery)
  payoutStatus: { type: String, enum: ['pending', 'on_hold', 'released', 'completed'], default: 'pending' },
  payoutReleaseDate: Date,
  payoutHoldUntil: Date, // 24 hours after delivery
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['customer', 'seller', 'admin'] },
  cancelledAt: Date,
  
  // Notes
  customerNotes: String,
  adminNotes: String
  
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
