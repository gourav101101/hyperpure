import dbConnect from './lib/mongodb';
import Category from './models/Category';

async function testAndSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected successfully!');
    
    // Check existing categories
    const existingCategories = await Category.find({});
    console.log('Existing categories:', existingCategories.length);
    
    // If no categories, seed some
    if (existingCategories.length === 0) {
      console.log('Seeding categories...');
      const sampleCategories = [
        { name: 'Fruits & Vegetables', icon: '🥬', order: 1 },
        { name: 'Dairy & Eggs', icon: '🥛', order: 2 },
        { name: 'Meat & Seafood', icon: '🍖', order: 3 },
        { name: 'Bakery', icon: '🍞', order: 4 },
        { name: 'Pantry', icon: '🥫', order: 5 },
        { name: 'Beverages', icon: '🥤', order: 6 },
        { name: 'Snacks', icon: '🍿', order: 7 }
      ];
      
      await Category.insertMany(sampleCategories);
      console.log('Categories seeded successfully!');
    }
    
    const categories = await Category.find({}).sort({ name: 1 });
    console.log('Final categories:', categories);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

testAndSeed();