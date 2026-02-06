const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function finalTest() {
  console.log('=== FINAL MONGODB CONNECTION TEST ===\n');
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    console.log('✅ SUCCESS! Connected to MongoDB Atlas!');
    
    // Test database operations
    const db = mongoose.connection.db;
    console.log('📊 Database:', db.databaseName);
    
    // Create Category schema
    const CategorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      icon: { type: String, required: true },
      order: { type: Number, default: 0 }
    }, { timestamps: true });
    
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    
    // Check existing categories
    const existingCount = await Category.countDocuments();
    console.log('📁 Existing categories:', existingCount);
    
    if (existingCount === 0) {
      console.log('🌱 Seeding categories...');
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
    
    // Fetch all categories
    const allCategories = await Category.find().sort({ order: 1 });
    console.log('📋 MongoDB Categories:');
    allCategories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} (Order: ${cat.order})`);
    });
    
    await mongoose.disconnect();
    console.log('\n🎉 MONGODB IS NOW WORKING!');
    console.log('🔄 Restart your Next.js server to see live MongoDB data');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to MongoDB Atlas Network Access');
      console.log('2. Add IP: 106.222.213.7 or 0.0.0.0/0');
      console.log('3. Wait 2-3 minutes for changes to take effect');
      console.log('4. Run this test again');
    }
  }
}

finalTest();