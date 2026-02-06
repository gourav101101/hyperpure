import mongoose from 'mongoose';

const FraudAlertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['fake_order', 'stock_manipulation', 'price_manipulation', 'multiple_accounts', 'suspicious_activity'],
    required: true 
  },
  
  // Target
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  // Details
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  description: { type: String, required: true },
  evidence: mongoose.Schema.Types.Mixed,
  
  // Status
  status: { type: String, enum: ['new', 'investigating', 'confirmed', 'false_alarm', 'resolved'], default: 'new' },
  
  // Action
  actionTaken: String,
  investigatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  notes: String,
  
}, { timestamps: true });

FraudAlertSchema.index({ type: 1, status: 1, severity: -1 });

export default mongoose.models.FraudAlert || mongoose.model('FraudAlert', FraudAlertSchema);
