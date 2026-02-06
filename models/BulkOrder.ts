import mongoose from 'mongoose';

const BulkOrderSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['restaurant', 'cafe', 'hotel', 'catering', 'other'], required: true },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: { type: Number, required: true },
    unit: String,
    requestedPrice: Number, // Price they want
    negotiatedPrice: Number, // Final agreed price
    notes: String
  }],
  
  // Delivery
  deliveryFrequency: { type: String, enum: ['one-time', 'weekly', 'bi-weekly', 'monthly'], default: 'one-time' },
  deliveryDate: Date,
  deliveryAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  
  // Pricing
  totalAmount: Number,
  discountPercent: { type: Number, default: 0 },
  finalAmount: Number,
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'quoted', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
  
  // Admin/Seller Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  adminNotes: String,
  
  // Payment
  paymentTerms: { type: String, enum: ['advance', 'cod', 'credit_7', 'credit_15', 'credit_30'], default: 'cod' },
  
  // Quote
  quotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quotedAt: Date,
  quoteValidTill: Date,
  
}, { timestamps: true });

export default mongoose.models.BulkOrder || mongoose.model('BulkOrder', BulkOrderSchema);
