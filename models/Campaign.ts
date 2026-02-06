import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['email', 'sms', 'push', 'whatsapp'], 
    required: true 
  },
  
  // Trigger
  trigger: {
    type: { 
      type: String, 
      enum: ['manual', 'order_placed', 'cart_abandoned', 'low_stock', 'new_product', 'birthday', 'inactive_user'],
      required: true 
    },
    conditions: mongoose.Schema.Types.Mixed
  },
  
  // Target
  targetAudience: {
    userType: { type: String, enum: ['all', 'customers', 'sellers', 'specific'] },
    tierFilter: [String], // ['bronze', 'silver']
    minOrders: Number,
    minSpent: Number,
    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Content
  subject: String,
  message: { type: String, required: true },
  template: String,
  variables: mongoose.Schema.Types.Mixed,
  
  // Offer
  offer: {
    type: { type: String, enum: ['discount', 'cashback', 'freebie', 'none'] },
    value: Number,
    code: String,
    validTill: Date
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed'], 
    default: 'draft' 
  },
  scheduledAt: Date,
  
  // Stats
  sent: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  converted: { type: Number, default: 0 },
  
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
