import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitType: { type: String, enum: ['Weight', 'Volume', 'Piece', 'Pack'], required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  images: [String],
  veg: { type: Boolean, default: true },
  description: String,
  keyFeatures: [String],
  servingInstructions: [String],
  sku: { type: String, unique: true, sparse: true },
  
  // Tax Information
  gstRate: { type: Number, default: 0 },
  cessRate: { type: Number, default: 0 },
  hsnCode: { type: String },
  
  // Storage & Safety
  shelfLife: String,
  storageInstructions: String,
  
  // Nutritional Info
  nutritionalInfo: {
    servingSize: String,
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String,
    sodium: String
  },
  
  // Additional Info
  brand: String,
  manufacturer: String,
  countryOfOrigin: String,
  ingredients: [String]
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
