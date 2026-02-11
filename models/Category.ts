import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  subcategories: [{
    name: { type: String, required: true },
    icon: String,
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
