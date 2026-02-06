// Test script to add categories via API
const categories = [
  { name: 'Fruits & Vegetables', icon: '🥬', order: 1 },
  { name: 'Dairy & Eggs', icon: '🥛', order: 2 },
  { name: 'Meat & Seafood', icon: '🍖', order: 3 },
  { name: 'Bakery', icon: '🍞', order: 4 },
  { name: 'Pantry', icon: '🥫', order: 5 },
  { name: 'Beverages', icon: '🥤', order: 6 },
  { name: 'Snacks', icon: '🍿', order: 7 }
];

async function testAPI() {
  try {
    // Test GET first - try different ports
    const ports = [3000, 3001, 3002];
    
    for (const port of ports) {
      console.log(`Testing GET http://localhost:${port}/api/categories...`);
      try {
        const getResponse = await fetch(`http://localhost:${port}/api/categories`);
        console.log(`Port ${port} - Status:`, getResponse.status);
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          console.log('Existing categories:', data.length);
          return; // Success, exit
        }
      } catch (error) {
        console.log(`Port ${port} - Connection failed:`, error.message);
      }
    }
    
    console.log('All ports failed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();