const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  category: String,
  description: String,
  images: [String],
  seller: String,
  stock: Number,
  sku: String
}, { timestamps: true });

module.exports = mongoose.models?.Product || mongoose.model('Product', ProductSchema);
