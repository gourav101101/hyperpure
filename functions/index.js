const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');

const dbConnect = require('./db');
const Blog = require('./models/Blog');
const Product = require('./models/Product');
const Seller = require('./models/Seller');
const Category = require('./models/Category');
const Location = require('./models/Location');
const cloudinary = require('./cloudinary');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Categories API error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    await dbConnect();
    const category = await Category.create(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
});

// Locations
app.get('/api/locations', async (req, res) => {
  try {
    await dbConnect();
    const locations = await Location.find({ active: true }).sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error('Locations API error:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    await dbConnect();
    const location = await Location.create(req.body);
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Blogs
app.get('/api/blogs', async (req, res) => {
  try {
    await dbConnect();
    const id = req.query.id;
    if (id) {
      const blog = await Blog.findById(id);
      return res.json(blog);
    }
    const blogs = await Blog.find({});
    return res.json(blogs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    await dbConnect();
    const blog = await Blog.create(req.body);
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
});

app.put('/api/blogs', async (req, res) => {
  try {
    await dbConnect();
    const { id, ...data } = req.body;
    const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/blogs', async (req, res) => {
  try {
    await dbConnect();
    const id = req.query.id;
    await Blog.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    await dbConnect();
    const id = req.query.id;
    if (id) {
      const product = await Product.findById(id);
      return res.json(product);
    }
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error('Products API error:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    await dbConnect();
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Create failed' });
  }
});

app.put('/api/products', async (req, res) => {
  try {
    await dbConnect();
    const { id, ...data } = req.body;
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/products', async (req, res) => {
  try {
    await dbConnect();
    const id = req.query.id;
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Sellers
app.get('/api/admin/sellers', async (req, res) => {
  try {
    await dbConnect();
    const sellers = await Seller.find({}).sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

app.put('/api/admin/sellers', async (req, res) => {
  try {
    await dbConnect();
    const { id, action, reason, adminName } = req.body;
    
    let updateData = {};
    if (action === 'approve') {
      updateData = { status: 'approved', verifiedBy: adminName, verifiedAt: new Date() };
    } else if (action === 'reject') {
      updateData = { status: 'rejected', rejectionReason: reason, verifiedBy: adminName, verifiedAt: new Date() };
    } else if (action === 'suspend') {
      updateData = { status: 'rejected', isActive: false, verifiedBy: adminName, verifiedAt: new Date() };
    }
    
    const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: 'Action failed' });
  }
});

app.get('/api/seller/products', async (req, res) => {
  try {
    await dbConnect();
    const { sellerId } = req.query;
    const products = await Product.find({ sellerId });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
});

// Upload (multipart/form-data)
app.post('/api/upload', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  let uploadError = null;
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const chunks = [];
    file.on('data', (data) => chunks.push(data));
    file.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'hyperpure' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          stream.end(buffer);
        });
        res.json({ url: result.secure_url });
      } catch (err) {
        uploadError = err;
        res.status(500).json({ error: 'Upload failed' });
      }
    });
  });
  busboy.on('finish', () => {
    if (uploadError) return; // response already sent
  });
  req.pipe(busboy);
});

// Fallback for other /api routes
app.all('/api/*', (req, res) => {
  res.status(501).json({ error: 'Not implemented in Functions scaffold. Please add route.' });
});

exports.api = functions.https.onRequest(app);
