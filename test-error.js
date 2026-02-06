async function testAPI() {
  try {
    console.log('Testing GET http://localhost:3001/api/categories...');
    const getResponse = await fetch('http://localhost:3001/api/categories');
    console.log('Status:', getResponse.status);
    
    const responseText = await getResponse.text();
    console.log('Response:', responseText);
    
    if (getResponse.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error data:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();