const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testDirectConnection() {
  console.log('=== TESTING DIRECT MONGODB CONNECTION ===\n');
  
  // Get the original URI
  const originalURI = process.env.MONGODB_URI;
  console.log('Original URI format:', originalURI.replace(/\/\/.*@/, '//***:***@'));
  
  // Try different connection approaches
  const connectionOptions = [
    {
      name: 'Original SRV with DNS cache disabled',
      uri: originalURI,
      options: {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        family: 4,
        directConnection: false,
        retryWrites: true,
        w: 'majority',
        bufferCommands: false,
        maxPoolSize: 10
      }
    },
    {
      name: 'Force IPv4 with longer timeout',
      uri: originalURI,
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        directConnection: false,
        retryWrites: true,
        w: 'majority'
      }
    }
  ];
  
  for (const config of connectionOptions) {
    try {
      console.log(`\nTrying: ${config.name}`);
      console.log('Connecting...');
      
      await mongoose.connect(config.uri, config.options);
      console.log('✅ SUCCESS! Connected to MongoDB Atlas');
      
      // Test database operations
      const db = mongoose.connection.db;
      console.log('Database name:', db.databaseName);
      
      // List collections
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      // Test a simple query
      const CategorySchema = new mongoose.Schema({
        name: String,
        icon: String,
        order: Number
      });
      const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
      
      const count = await Category.countDocuments();
      console.log('Category count:', count);
      
      if (count === 0) {
        console.log('Inserting test categories...');
        await Category.insertMany([
          { name: 'Fruits & Vegetables', icon: '🥬', order: 1 },
          { name: 'Dairy & Eggs', icon: '🥛', order: 2 },
          { name: 'Meat & Seafood', icon: '🍖', order: 3 },
          { name: 'Bakery', icon: '🍞', order: 4 },
          { name: 'Pantry', icon: '🥫', order: 5 },
          { name: 'Beverages', icon: '🥤', order: 6 },
          { name: 'Snacks', icon: '🍿', order: 7 }
        ]);
        console.log('✅ Categories inserted successfully!');
      }
      
      const categories = await Category.find().sort({ order: 1 });
      console.log('MongoDB Categories:', categories.map(c => ({ name: c.name, icon: c.icon })));
      
      await mongoose.disconnect();
      console.log('✅ Connection test successful!');
      return true;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return false;
}

testDirectConnection();