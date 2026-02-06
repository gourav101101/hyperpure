const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function seedMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Check existing data
    const existingCount = await Category.countDocuments();
    console.log('Existing categories:', existingCount);
    
    if (existingCount === 0) {
      console.log('Seeding categories...');
      const categories = [
        { name: 'Fruits & Vegetables', icon: '🥬', order: 1 },
        { name: 'Dairy & Eggs', icon: '🥛', order: 2 },
        { name: 'Meat & Seafood', icon: '🍖', order: 3 },
        { name: 'Bakery', icon: '🍞', order: 4 },
        { name: 'Pantry', icon: '🥫', order: 5 },
        { name: 'Beverages', icon: '🥤', order: 6 },
        { name: 'Snacks', icon: '🍿', order: 7 }
      ];
      
      await Category.insertMany(categories);
      console.log('✅ Categories seeded successfully!');
    }
    
    const allCategories = await Category.find().sort({ order: 1 });
    console.log('MongoDB Categories:', allCategories.map(c => c.name));
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('Your app will use local database instead');
  } finally {
    await mongoose.disconnect();
  }
}

seedMongoDB();