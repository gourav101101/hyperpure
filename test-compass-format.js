const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testCompassFormat() {
  console.log('=== TESTING COMPASS-STYLE CONNECTION ===\n');
  
  // Different connection string formats to try
  const connectionStrings = [
    // Original SRV (might work now with IP whitelisted)
    'mongodb+srv://gourav101101:gourav%40123@cluster0.mongodb.net/hyperpure?retryWrites=true&w=majority',
    
    // Standard with different SSL options
    'mongodb://gourav101101:gourav%40123@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/hyperpure?ssl=true&replicaSet=atlas-14hdqp-shard-0&authSource=admin&retryWrites=true&w=majority',
    
    // Simplified standard
    'mongodb://gourav101101:gourav%40123@cluster0.mongodb.net:27017/hyperpure?authSource=admin&retryWrites=true&w=majority&ssl=true',
    
    // Without SSL
    'mongodb://gourav101101:gourav%40123@cluster0.mongodb.net:27017/hyperpure?authSource=admin&retryWrites=true&w=majority'
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`\n🔗 Testing connection ${i + 1}...`);
    console.log('Format:', uri.includes('srv') ? 'SRV' : 'Standard');
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      console.log('✅ SUCCESS! Connected to MongoDB Atlas!');
      
      // Quick test
      const db = mongoose.connection.db;
      console.log('Database:', db.databaseName);
      
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      await mongoose.disconnect();
      
      console.log('\n🎉 WORKING CONNECTION STRING:');
      console.log(`MONGODB_URI=${uri}`);
      
      return uri;
      
    } catch (error) {
      console.log('❌ Failed:', error.message.substring(0, 100) + '...');
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  console.log('\n🔍 DEBUGGING INFO:');
  console.log('- IP is whitelisted: ✅');
  console.log('- Password is URL encoded: ✅');
  console.log('- Multiple formats tested: ✅');
  
  console.log('\n💡 POSSIBLE ISSUES:');
  console.log('1. MongoDB Atlas cluster is paused/stopped');
  console.log('2. Database user permissions issue');
  console.log('3. Network routing problem');
  console.log('4. Cluster region restrictions');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check if cluster is running in MongoDB Atlas');
  console.log('2. Verify database user has read/write permissions');
  console.log('3. Try connecting from MongoDB Compass again');
  console.log('4. Copy exact connection string from Compass');
}

testCompassFormat();