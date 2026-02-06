import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['seller', 'customer', 'admin'], required: true },
  
  type: { 
    type: String, 
    enum: [
      'new_order', 'order_status', 'payout', 'low_stock', 
      'price_alert', 'review', 'performance', 'bulk_order'
    ], 
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Related data
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  
  // Action
  actionUrl: String,
  actionText: String,
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Priority
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
