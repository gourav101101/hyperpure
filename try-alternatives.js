const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

async function tryAlternativeConnections() {
  console.log('=== TRYING ALTERNATIVE MONGODB CONNECTIONS ===\n');
  
  console.log('1. Testing DNS resolution...');
  const originalURI = process.env.MONGODB_URI;
  
  if (!originalURI) {
    console.log('❌ MONGODB_URI not found in .env.local');
    return;
  }
  
  const hostname = originalURI.match(/@([^/]+)/)?.[1];
  if (hostname) {
    try {
      const addresses = await dns.promises.resolve(hostname);
      console.log('✅ DNS resolved:', addresses);
    } catch (error) {
      console.log('❌ DNS resolution failed:', error.message);
    }
  }
  
  const standardURI = originalURI.replace('mongodb+srv://', 'mongodb://');
  
  const connectionAttempts = [
    { name: 'Original SRV', uri: originalURI },
    { name: 'Standard MongoDB URI', uri: standardURI },
    { name: 'With SSL disabled', uri: originalURI + '&ssl=false' }
  ];
  
  for (const attempt of connectionAttempts) {
    try {
      console.log(`\nTrying: ${attempt.name}`);
      
      await mongoose.connect(attempt.uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      console.log('✅ SUCCESS! Connected to MongoDB');
      
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      await mongoose.disconnect();
      return attempt.uri;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

tryAlternativeConnections();