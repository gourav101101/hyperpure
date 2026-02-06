const dns = require('dns');
const net = require('net');

async function diagnoseNetwork() {
  console.log('=== MONGODB ATLAS NETWORK DIAGNOSIS ===\n');
  
  // 1. Test basic internet connectivity
  console.log('1. Testing basic internet connectivity...');
  try {
    const addresses = await dns.promises.resolve('google.com');
    console.log('✅ Internet connection working');
  } catch (error) {
    console.log('❌ No internet connection');
    return;
  }
  
  // 2. Test DNS resolution for MongoDB Atlas
  console.log('\n2. Testing MongoDB Atlas DNS resolution...');
  const hosts = [
    'cluster0.mongodb.net',
    'cluster0-shard-00-00.mongodb.net',
    '_mongodb._tcp.cluster0.mongodb.net'
  ];
  
  for (const host of hosts) {
    try {
      const addresses = await dns.promises.resolve(host);
      console.log(`✅ ${host} resolved to:`, addresses);
    } catch (error) {
      console.log(`❌ ${host} failed:`, error.code);
    }
  }
  
  // 3. Test MongoDB port connectivity
  console.log('\n3. Testing MongoDB port connectivity...');
  const testConnection = (host, port) => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 5000);
      
      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  };
  
  try {
    const addresses = await dns.promises.resolve('cluster0-shard-00-00.mongodb.net');
    const canConnect = await testConnection(addresses[0], 27017);
    console.log(`MongoDB port 27017: ${canConnect ? '✅ Open' : '❌ Blocked'}`);
  } catch (error) {
    console.log('❌ Cannot test port - DNS resolution failed');
  }
  
  console.log('\n=== DIAGNOSIS COMPLETE ===');
  console.log('\n🔧 SOLUTIONS:');
  console.log('1. Try connecting from a different network (mobile hotspot)');
  console.log('2. Use VPN to bypass network restrictions');
  console.log('3. Contact your ISP about MongoDB Atlas access');
  console.log('4. Use local database (current fallback working)');
  console.log('5. Consider using MongoDB locally with Docker');
}

diagnoseNetwork();