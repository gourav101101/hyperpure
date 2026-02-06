import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderType: { type: String, enum: ['admin', 'seller', 'customer'], required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverType: { type: String, enum: ['admin', 'seller', 'customer'], required: true },
  
  // Message
  message: { type: String, required: true },
  attachments: [String],
  
  // Context
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
