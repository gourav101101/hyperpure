const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testCompassFormat() {
  console.log('=== TESTING COMPASS-STYLE CONNECTION ===\n');
  
  const connectionStrings = [
    process.env.MONGODB_URI,
    process.env.MONGODB_URI?.replace('mongodb+srv://', 'mongodb://'),
  ].filter(Boolean);
  
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
      
      const db = mongoose.connection.db;
      console.log('Database:', db.databaseName);
      
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      await mongoose.disconnect();
      console.log('\n🎉 Connection successful!');
      return uri;
      
    } catch (error) {
      console.log('❌ Failed:', error.message.substring(0, 100) + '...');
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
}

testCompassFormat();