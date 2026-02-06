// Run this script once to initialize the system
// node setup-advanced-system.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CommissionSchema = new mongoose.Schema({
  defaultRate: { type: Number, default: 10 },
  categoryRates: [{ category: String, rate: Number }],
  sellerTierRates: {
    premium: { type: Number, default: 8 },
    standard: { type: Number, default: 10 },
    new: { type: Number, default: 12 }
  },
  deliveryFee: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SellerPerformanceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  fulfillmentRate: { type: Number, default: 100 },
  cancellationRate: { type: Number, default: 0 },
  avgDeliveryTime: { type: Number, default: 0 },
  onTimeDeliveryRate: { type: Number, default: 100 },
  qualityScore: { type: Number, default: 5, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  stockAccuracy: { type: Number, default: 100 },
  outOfStockIncidents: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCommissionPaid: { type: Number, default: 0 },
  tier: { type: String, enum: ['new', 'standard', 'premium'], default: 'new' },
  avgResponseTime: { type: Number, default: 0 },
  totalComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false }
}, { timestamps: true });

const Commission = mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);
const SellerPerformance = mongoose.models.SellerPerformance || mongoose.model('SellerPerformance', SellerPerformanceSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));

async function setupAdvancedSystem() {
  try {
    console.log('🚀 Setting up Advanced Seller System...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Create default commission structure
    console.log('📊 Setting up commission structure...');
    const existingCommission = await Commission.findOne({ isActive: true });
    
    if (!existingCommission) {
      await Commission.create({
        defaultRate: 10,
        categoryRates: [],
        sellerTierRates: {
          premium: 8,
          standard: 10,
          new: 12
        },
        deliveryFee: 30,
        isActive: true
      });
      console.log('✅ Commission structure created (10% default)\n');
    } else {
      console.log('ℹ️  Commission structure already exists\n');
    }

    // 2. Create performance records for all existing sellers
    console.log('👥 Setting up seller performance tracking...');
    const sellers = await Seller.find({});
    console.log(`Found ${sellers.length} sellers\n`);

    let created = 0;
    for (const seller of sellers) {
      const existing = await SellerPerformance.findOne({ sellerId: seller._id });
      if (!existing) {
        await SellerPerformance.create({
          sellerId: seller._id,
          tier: 'new'
        });
        created++;
      }
    }
    console.log(`✅ Created ${created} new performance records\n`);

    console.log('🎉 Advanced System Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Go to /admin/commission to adjust rates');
    console.log('2. Go to /seller/dashboard to see performance metrics');
    console.log('3. Orders will now use smart routing automatically\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdvancedSystem();
