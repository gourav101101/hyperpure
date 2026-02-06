const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function debugAPI() {
  console.log('=== API DEBUG ANALYSIS ===\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('URI format:', process.env.MONGODB_URI ? 'mongodb+srv://***' : 'Missing');
  console.log();
  
  // 2. Test direct MongoDB connection
  console.log('2. Testing MongoDB Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Test Category model
    const CategorySchema = new mongoose.Schema({
      name: String,
      icon: String,
      order: Number
    });
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    
    const categoryCount = await Category.countDocuments();
    console.log('Category count:', categoryCount);
    
    if (categoryCount === 0) {
      console.log('Inserting test category...');
      await Category.create({ name: 'Test Category', icon: '🧪', order: 1 });
      console.log('Test category inserted');
    }
    
    const categories = await Category.find().limit(3);
    console.log('Sample categories:', categories);
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 DNS Resolution Issue:');
      console.log('- Your network cannot resolve MongoDB Atlas hostname');
      console.log('- Try using a different network or VPN');
      console.log('- Check if corporate firewall is blocking MongoDB');
    }
  }
  
  // 3. Test Next.js API route directly
  console.log('\n3. Testing Next.js API Route:');
  try {
    const response = await fetch('http://localhost:3001/api/categories');
    console.log('API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Data:', data);
    } else {
      const errorText = await response.text();
      console.log('API Error:', errorText);
    }
  } catch (error) {
    console.log('❌ API Request failed:', error.message);
    console.log('- Make sure Next.js dev server is running');
    console.log('- Check if port 3001 is correct');
  }
  
  await mongoose.disconnect();
  console.log('\n=== DEBUG COMPLETE ===');
}

debugAPI().catch(console.error);