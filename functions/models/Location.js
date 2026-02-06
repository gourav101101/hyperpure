const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models?.Location || mongoose.model('Location', LocationSchema);