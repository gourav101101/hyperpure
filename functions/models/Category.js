const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  subcategories: [{
    name: { type: String, required: true },
    icon: String
  }]
}, { timestamps: true });

module.exports = mongoose.models?.Category || mongoose.model('Category', CategorySchema);