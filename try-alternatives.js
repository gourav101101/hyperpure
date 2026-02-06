const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

async function tryAlternativeConnections() {
  console.log('=== TRYING ALTERNATIVE MONGODB CONNECTIONS ===\n');
  
  // 1. Test DNS resolution
  console.log('1. Testing DNS resolution...');
  try {
    const addresses = await dns.promises.resolve('cluster0.mongodb.net');
    console.log('✅ DNS resolved:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    console.log('This confirms the network/DNS issue');
  }
  
  // 2. Try different connection strings
  const originalURI = process.env.MONGODB_URI;
  
  // Convert SRV to standard format
  const standardURI = originalURI.replace('mongodb+srv://', 'mongodb://').replace('@cluster0.mongodb.net/', '@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/');
  
  const connectionAttempts = [
    {
      name: 'Original SRV',
      uri: originalURI
    },
    {
      name: 'Standard MongoDB URI',
      uri: standardURI
    },
    {
      name: 'With SSL disabled',
      uri: originalURI + '&ssl=false'
    }
  ];
  
  for (const attempt of connectionAttempts) {
    try {
      console.log(`\nTrying: ${attempt.name}`);
      console.log(`URI: ${attempt.uri.replace(/\/\/.*@/, '//***:***@')}`);
      
      await mongoose.connect(attempt.uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      console.log('✅ SUCCESS! Connected to MongoDB');
      
      // Test a simple operation
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
  console.log('\n🔧 NETWORK TROUBLESHOOTING:');
  console.log('Your network cannot reach MongoDB Atlas servers');
  console.log('This could be due to:');
  console.log('- Corporate firewall blocking MongoDB ports');
  console.log('- ISP blocking MongoDB Atlas');
  console.log('- DNS server issues');
  console.log('- Geographic restrictions');
  
  return null;
}

tryAlternativeConnections();