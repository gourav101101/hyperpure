const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function tryStandardConnection() {
  console.log('=== TRYING STANDARD MONGODB CONNECTION ===\n');
  
  // Convert SRV to standard connection string
  // MongoDB Atlas cluster typically has these shard addresses
  const standardURIs = [
    // Standard format with all shards
    'mongodb://gourav101101:gourav%40123@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/hyperpure?ssl=true&replicaSet=atlas-123abc-shard-0&authSource=admin&retryWrites=true&w=majority',
    
    // Simplified standard format
    'mongodb://gourav101101:gourav%40123@cluster0.mongodb.net:27017/hyperpure?ssl=true&authSource=admin&retryWrites=true&w=majority',
    
    // Alternative cluster naming
    'mongodb://gourav101101:gourav%40123@ac-abc123-shard-00-00.mongodb.net:27017/hyperpure?ssl=true&authSource=admin&retryWrites=true&w=majority'
  ];
  
  for (let i = 0; i < standardURIs.length; i++) {
    const uri = standardURIs[i];
    try {
      console.log(`\nTrying standard connection ${i + 1}...`);
      console.log('URI format:', uri.replace(/\/\/.*@/, '//***:***@'));
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ SUCCESS! Connected with standard URI');
      
      // Test database operations
      const db = mongoose.connection.db;
      console.log('Database:', db.databaseName);
      
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      await mongoose.disconnect();
      console.log('✅ Standard connection works!');
      console.log('\n🔧 UPDATE YOUR .env.local WITH:');
      console.log(`MONGODB_URI=${uri}`);
      return uri;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All standard connection attempts failed');
  console.log('\n💡 SOLUTION: Get exact connection string from MongoDB Compass');
  console.log('1. Open MongoDB Compass');
  console.log('2. Connect to your cluster');
  console.log('3. Copy the connection string from Compass');
  console.log('4. Replace the SRV URI in .env.local');
  
  return null;
}

tryStandardConnection();