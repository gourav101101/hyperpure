const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixMongoConnection() {
  console.log('=== FIXING MONGODB CONNECTION ===\n');
  
  const originalURI = process.env.MONGODB_URI;
  console.log('Original URI:', originalURI);
  
  // Try different connection approaches
  const connectionOptions = [
    {
      name: 'Standard with DNS',
      uri: originalURI,
      options: {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        family: 4, // Force IPv4
      }
    },
    {
      name: 'With explicit DNS servers',
      uri: originalURI,
      options: {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        family: 4,
        directConnection: false,
        retryWrites: true,
      }
    }
  ];
  
  for (const config of connectionOptions) {
    try {
      console.log(`\nTrying: ${config.name}`);
      await mongoose.connect(config.uri, config.options);
      console.log('✅ SUCCESS! MongoDB connected');
      
      // Test database operations
      const db = mongoose.connection.db;
      const adminDb = db.admin();
      const result = await adminDb.ping();
      console.log('Database ping:', result);
      
      // List databases
      const databases = await adminDb.listDatabases();
      console.log('Available databases:', databases.databases.map(d => d.name));
      
      await mongoose.disconnect();
      console.log('Connection test successful!');
      return true;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n🔧 ALTERNATIVE SOLUTIONS:');
  console.log('1. Use MongoDB Compass to test connection');
  console.log('2. Try connecting from a different network');
  console.log('3. Check MongoDB Atlas network access settings');
  console.log('4. Whitelist IP: 0.0.0.0/0 in MongoDB Atlas');
  
  return false;
}

fixMongoConnection();