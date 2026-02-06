const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  author: String,
  date: String,
  readTime: String,
  featuredImage: String,
  blocks: [{ id: String, type: String, content: String }],
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models?.Blog || mongoose.model('Blog', BlogSchema);
