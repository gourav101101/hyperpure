async function testFixedAPIs() {
  console.log('=== TESTING FIXED APIs ===\n');
  
  const endpoints = [
    'http://localhost:3001/api/categories',
    'http://localhost:3001/api/locations', 
    'http://localhost:3001/api/products'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(endpoint);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success - Got ${data.length} items`);
        console.log(`Sample:`, data[0]);
      } else {
        const error = await response.text();
        console.log(`❌ Error:`, error);
      }
      console.log();
    } catch (error) {
      console.log(`❌ Request failed:`, error.message);
      console.log();
    }
  }
  
  console.log('=== TEST COMPLETE ===');
}

testFixedAPIs();