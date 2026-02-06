import dbConnect from '@/lib/mongodb';
import SellerProduct from '@/models/SellerProduct';
import SellerPerformance from '@/models/SellerPerformance';
import DeliveryZone from '@/models/DeliveryZone';
import Commission from '@/models/Commission';
import TierCommission from '@/models/TierCommission';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface SellerScore {
  sellerId: string;
  sellerProductId: string;
  score: number;
  price: number;
  stock: number;
  distance?: number;
  tier: string;
  fulfillmentRate: number;
}

export class OrderRouter {
  
  /**
   * Find best seller for a product based on multiple factors
   */
  static async findBestSeller(
    productId: string, 
    quantity: number,
    deliveryPincode?: string
  ): Promise<any> {
    await dbConnect();
    
    // Get all active sellers with this product in stock
    const sellerProducts = await SellerProduct.find({
      productId,
      isActive: true,
      stock: { $gte: quantity }
    }).lean();

    if (sellerProducts.length === 0) {
      return null;
    }

    // Get performance data for all sellers
    const sellerIds = sellerProducts.map((sp: any) => sp.sellerId).filter(Boolean);
    const performances = await SellerPerformance.find({
      sellerId: { $in: sellerIds },
      isActive: true,
      isSuspended: false
    }).lean();

    const performanceMap = new Map();
    performances.forEach((p: any) => {
      performanceMap.set(p.sellerId.toString(), p);
    });

    // Score each seller
    const scoredSellers: SellerScore[] = [];

    for (const sp of sellerProducts) {
      const sellerId = (sp as any).sellerId?.toString?.() || (sp as any).sellerId;
      if (!sellerId) continue;
      const performance = performanceMap.get(sellerId?.toString());
      
      if (!performance) continue; // Skip sellers without performance data

      let score = 0;

      // 1. Price (40 points) - Lower price = higher score
      const minPrice = Math.min(...sellerProducts.map((s: any) => s.sellerPrice));
      const priceScore = ((minPrice / (sp as any).sellerPrice) * 40);
      score += priceScore;

      // 2. Fulfillment Rate (30 points)
      score += (performance.fulfillmentRate / 100) * 30;

      // 3. Quality Score (20 points)
      score += (performance.qualityScore / 5) * 20;

      // 4. Tier Bonus (10 points)
      const tierBonus = {
        premium: 10,
        standard: 5,
        new: 0
      };
      score += tierBonus[performance.tier as keyof typeof tierBonus] || 0;

      // 5. Stock availability bonus (if stock > 2x quantity)
      if ((sp as any).stock >= quantity * 2) {
        score += 5;
      }

      scoredSellers.push({
        sellerId: sellerId.toString(),
        sellerProductId: (sp as any)._id.toString(),
        score,
        price: (sp as any).sellerPrice,
        stock: (sp as any).stock,
        tier: performance.tier,
        fulfillmentRate: performance.fulfillmentRate
      });
    }

    // Sort by score (highest first)
    scoredSellers.sort((a, b) => b.score - a.score);

    // Return best seller with full details
    const bestSeller = scoredSellers[0];
    const sellerProduct = sellerProducts.find(
      (sp: any) => sp._id.toString() === bestSeller.sellerProductId
    );

    return {
      ...sellerProduct,
      score: bestSeller.score,
      tier: bestSeller.tier
    };
  }

  /**
   * Route entire order to sellers (can split across multiple sellers)
   */
  static async routeOrder(items: OrderItem[], deliveryPincode?: string): Promise<any> {
    const routedItems = [];
    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10, deliveryFee: 30 };
    const tierCommissions = await TierCommission.find({ isActive: true }).lean();
    const tierMap = new Map(tierCommissions.map((tc: any) => [tc.tier, tc.commissionRate]));

    for (const item of items) {
      const bestSeller = await this.findBestSeller(
        item.productId,
        item.quantity,
        deliveryPincode
      );

      if (!bestSeller) {
        routedItems.push({
          ...item,
          available: false,
          error: 'Out of stock'
        });
        continue;
      }

      // Calculate commission - Zomato Model (commission added on top)
      const sellerPrice = bestSeller.sellerPrice;
      const sellerTier = bestSeller.tier || 'standard';
      const commissionRate = tierMap.get(sellerTier) || commission.commissionRate || 10;
      const commissionAmount = (sellerPrice * item.quantity * commissionRate) / 100;
      const customerPrice = sellerPrice * (1 + commissionRate / 100); // Customer pays seller price + commission

      routedItems.push({
        productId: item.productId,
        sellerProductId: bestSeller._id,
        sellerId: bestSeller.sellerId._id || bestSeller.sellerId,
        quantity: item.quantity,
        price: customerPrice,
        sellerPrice: sellerPrice,
        commissionRate,
        commissionAmount,
        unitValue: bestSeller.unitValue,
        unitMeasure: bestSeller.unitMeasure,
        available: true
      });
    }

    return {
      items: routedItems,
      deliveryFee: commission.deliveryFee || 30
    };
  }

  /**
   * Get lowest price for a product (for display on catalogue)
   */
  static async getLowestPrice(productId: string): Promise<any> {
    const sellerProducts = await SellerProduct.find({
      productId,
      isActive: true,
      stock: { $gt: 0 }
    }).sort({ sellerPrice: 1 }).limit(1).lean();

    if (sellerProducts.length === 0) {
      return null;
    }

    const sp = sellerProducts[0];
    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
    const customerPrice = sp.sellerPrice * (1 + commission.commissionRate / 100);
    
    return {
      price: Math.round(customerPrice), // Customer pays this (seller price + commission)
      packSize: `${sp.unitValue} ${sp.unitMeasure}`,
      unit: sp.unitMeasure,
      available: true
    };
  }

  /**
   * Get all available pack sizes for a product (from all sellers)
   */
  static async getAvailablePackSizes(productId: string): Promise<any[]> {
    const sellerProducts = await SellerProduct.find({
      productId,
      isActive: true,
      stock: { $gt: 0 }
    }).lean();

    const commission = await Commission.findOne({ isActive: true }) || { commissionRate: 10 };
    const packSizeMap = new Map();

    for (const sp of sellerProducts) {
      const key = `${(sp as any).unitValue}_${(sp as any).unitMeasure}`;
      const existing = packSizeMap.get(key);
      const sellerPrice = (sp as any).sellerPrice;
      const commissionAmount = sellerPrice * commission.commissionRate / 100;
      const customerPrice = sellerPrice + commissionAmount;

      const sellerId = (sp as any).sellerId;
      if (!sellerId) continue;

      if (!existing || customerPrice < existing.price) {
        packSizeMap.set(key, {
          unitValue: (sp as any).unitValue,
          unitMeasure: (sp as any).unitMeasure,
          price: Math.round(customerPrice), // Customer pays this
          sellerPrice: sellerPrice, // Seller base price
          commissionAmount: Math.round(commissionAmount),
          stock: (sp as any).stock,
          sellerProductId: (sp as any)._id,
          sellerId
        });
      }
    }

    return Array.from(packSizeMap.values()).sort((a, b) => a.unitValue - b.unitValue);
  }
}
