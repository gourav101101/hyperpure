const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');
    
    // Seed categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
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
      console.log('Categories seeded!');
    }
    
    // Seed locations
    const locationCount = await Location.countDocuments();
    if (locationCount === 0) {
      console.log('Seeding locations...');
      const locations = [
        { name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', pincode: '400008', active: true },
        { name: 'Delhi NCR', city: 'Delhi', state: 'Delhi', pincode: '110001', active: true },
        { name: 'Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '560001', active: true },
        { name: 'Pune', city: 'Pune', state: 'Maharashtra', pincode: '411001', active: true },
        { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', active: true }
      ];
      await Location.insertMany(locations);
      console.log('Locations seeded!');
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
  await mongoose.disconnect();
  process.exit(0);
}

seedData();