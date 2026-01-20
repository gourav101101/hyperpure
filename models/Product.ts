import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  images: [String],
  veg: { type: Boolean, default: true },
  description: String,
  keyFeatures: [String],
  servingInstructions: [String],
  packSize: String,
  sku: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
