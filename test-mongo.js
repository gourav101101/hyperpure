const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Possible fixes:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check if your IP is whitelisted in MongoDB Atlas');
      console.log('4. Verify the connection string is correct');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();