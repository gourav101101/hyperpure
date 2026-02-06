const https = require('https');

async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function setupMongoDB() {
  console.log('=== MONGODB ATLAS SETUP GUIDE ===\n');
  
  try {
    const publicIP = await getPublicIP();
    console.log('🌐 Your current public IP:', publicIP);
  } catch (error) {
    console.log('❌ Could not get public IP:', error.message);
  }
  
  console.log('\n📋 STEPS TO FIX MONGODB CONNECTION:');
  console.log('\n1. 🔓 WHITELIST YOUR IP IN MONGODB ATLAS:');
  console.log('   - Go to: https://cloud.mongodb.com/v2/6971016515e61cfb38a4f22c#/security/network/accessList');
  console.log('   - Click "ADD IP ADDRESS"');
  console.log('   - Add: 0.0.0.0/0 (allows all IPs for development)');
  console.log('   - Or add your specific IP from above');
  console.log('   - Click "Confirm"');
  
  console.log('\n2. 📋 GET CONNECTION STRING FROM COMPASS:');
  console.log('   - Open MongoDB Compass');
  console.log('   - Connect to your cluster');
  console.log('   - Copy the connection string used by Compass');
  console.log('   - It should look like:');
  console.log('   mongodb://gourav101101:gourav%40123@cluster0-shard-00-00.mongodb.net:27017/hyperpure?ssl=true&authSource=admin');
  
  console.log('\n3. 🔧 UPDATE .env.local:');
  console.log('   Replace the current MONGODB_URI with the Compass connection string');
  
  console.log('\n4. 🧪 TEST CONNECTION:');
  console.log('   Run: node test-direct-mongo.js');
  
  console.log('\n⚡ QUICK FIX - Try this connection string:');
  console.log('MONGODB_URI=mongodb://gourav101101:gourav%40123@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/hyperpure?ssl=true&authSource=admin&retryWrites=true&w=majority');
}

setupMongoDB();