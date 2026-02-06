import SellerProduct from '@/models/SellerProduct';
import Order from '@/models/Order';

export class PricingIntelligence {
  
  static async getSellerPriceRank(sellerId: string, productId: string): Promise<any> {
    const allPrices = await SellerProduct.find({ 
      productId, 
      isActive: true, 
      stock: { $gt: 0 } 
    })
    .sort({ sellerPrice: 1 })
    .lean();
    
    const sellerProduct = allPrices.find((p: any) => p.sellerId.toString() === sellerId);
    if (!sellerProduct) return null;
    
    const rank = allPrices.findIndex((p: any) => p.sellerId.toString() === sellerId) + 1;
    const totalSellers = allPrices.length;
    const lowestPrice = allPrices[0].sellerPrice;
    const highestPrice = allPrices[allPrices.length - 1].sellerPrice;
    const avgPrice = allPrices.reduce((sum: number, p: any) => sum + p.sellerPrice, 0) / totalSellers;
    
    return {
      rank,
      totalSellers,
      yourPrice: (sellerProduct as any).sellerPrice,
      lowestPrice,
      highestPrice,
      avgPrice: Math.round(avgPrice),
      percentageAboveLowest: Math.round((((sellerProduct as any).sellerPrice - lowestPrice) / lowestPrice) * 100)
    };
  }
  
  static async getSuggestedPrice(productId: string, sellerId: string): Promise<any> {
    const prices = await SellerProduct.find({ 
      productId, 
      isActive: true, 
      stock: { $gt: 0 } 
    }).lean();
    
    if (prices.length === 0) return null;
    
    const avgPrice = prices.reduce((sum: number, p: any) => sum + p.sellerPrice, 0) / prices.length;
    const lowestPrice = Math.min(...prices.map((p: any) => p.sellerPrice));
    
    // Get demand data
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orders = await Order.find({
      'items.productId': productId,
      createdAt: { $gte: last30Days }
    }).lean();
    
    const demand = orders.length;
    let suggestedPrice = avgPrice;
    
    // High demand = can charge more
    if (demand > 100) {
      suggestedPrice = avgPrice * 1.05;
    } else if (demand < 20) {
      suggestedPrice = lowestPrice * 1.02;
    }
    
    return {
      suggested: Math.round(suggestedPrice),
      reason: demand > 100 ? 'High demand' : demand < 20 ? 'Low demand - price competitively' : 'Average market price',
      marketAvg: Math.round(avgPrice),
      lowestCompetitor: lowestPrice,
      demand: demand > 100 ? 'high' : demand > 50 ? 'medium' : 'low'
    };
  }
  
  static async getDynamicPrice(productId: string, basePrice: number, options: any = {}): Promise<number> {
    const { surge = false, flash = false, bulkQuantity = 1, location = null } = options;
    
    let finalPrice = basePrice;
    
    // Surge pricing (high demand periods)
    if (surge) {
      const hour = new Date().getHours();
      if (hour >= 18 && hour <= 21) { // Evening peak
        finalPrice *= 1.15;
      }
    }
    
    // Flash sale
    if (flash) {
      finalPrice *= 0.85;
    }
    
    // Bulk discount
    if (bulkQuantity >= 10) {
      finalPrice *= 0.90;
    } else if (bulkQuantity >= 5) {
      finalPrice *= 0.95;
    }
    
    // Location-based (premium areas)
    if (location && ['110001', '400001', '560001'].includes(location)) {
      finalPrice *= 1.05;
    }
    
    return Math.round(finalPrice);
  }
  
  static async getCompetitorAnalysis(sellerId: string, productId: string): Promise<any> {
    const allProducts = await SellerProduct.find({ 
      productId, 
      isActive: true 
    })
    .populate('sellerId', 'name')
    .lean();
    
    const competitors = allProducts
      .filter((p: any) => p.sellerId._id.toString() !== sellerId)
      .map((p: any) => ({
        price: p.sellerPrice,
        stock: p.stock,
        unitValue: p.unitValue,
        unitMeasure: p.unitMeasure
      }));
    
    return {
      totalCompetitors: competitors.length,
      priceRange: {
        min: Math.min(...competitors.map(c => c.price)),
        max: Math.max(...competitors.map(c => c.price)),
        avg: Math.round(competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length)
      },
      stockAvailability: competitors.filter(c => c.stock > 0).length
    };
  }
}
