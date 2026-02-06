import SellerProduct from '@/models/SellerProduct';
import Order from '@/models/Order';
import SellerPerformance from '@/models/SellerPerformance';
import SellerAutoPilot from '@/models/SellerAutoPilot';
import SellerAchievement from '@/models/SellerAchievement';
import SellerInsights from '@/models/SellerInsights';

export class SellerIntelligence {
  
  // Auto-Pilot: Auto-accept orders
  static async autoAcceptOrder(sellerId: string, orderId: string): Promise<boolean> {
    const autoPilot = await SellerAutoPilot.findOne({ sellerId, 'autoAccept.enabled': true });
    if (!autoPilot) return false;
    
    const order = await Order.findById(orderId);
    if (!order) return false;
    
    const orderValue = order.totalAmount;
    
    // Check constraints
    if (orderValue > autoPilot.autoAccept.maxOrderValue) return false;
    if (orderValue < autoPilot.autoAccept.minOrderValue) return false;
    
    // Check blacklist
    if (autoPilot.autoAccept.blacklistedCustomers.includes(order.userId)) return false;
    
    // Auto-accept
    order.status = 'confirmed';
    await order.save();
    
    // Update stats
    autoPilot.stats.ordersAutoAccepted += 1;
    autoPilot.stats.timeSaved += 5; // 5 minutes saved
    await autoPilot.save();
    
    return true;
  }
  
  // Auto-Pricing: Adjust prices based on competition
  static async autoPriceAdjustment(sellerId: string, productId: string): Promise<number | null> {
    const autoPilot = await SellerAutoPilot.findOne({ sellerId, 'autoPricing.enabled': true });
    if (!autoPilot) return null;
    
    const sellerProduct = await SellerProduct.findOne({ sellerId, productId });
    if (!sellerProduct) return null;
    
    // Get competitor prices
    const competitors = await SellerProduct.find({ 
      productId, 
      sellerId: { $ne: sellerId },
      isActive: true 
    }).lean();
    
    if (competitors.length === 0) return null;
    
    const prices = competitors.map((c: any) => c.sellerPrice);
    const lowestPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    let newPrice = sellerProduct.sellerPrice;
    
    switch (autoPilot.autoPricing.strategy) {
      case 'match_lowest':
        newPrice = lowestPrice + autoPilot.autoPricing.priceOffset;
        break;
      case 'stay_above':
        newPrice = lowestPrice + 2;
        break;
      case 'premium':
        newPrice = avgPrice * 1.1;
        break;
    }
    
    // Apply surge pricing if enabled
    if (autoPilot.autoPricing.surgePricing) {
      const hour = new Date().getHours();
      if (hour >= 18 && hour <= 21) {
        newPrice *= autoPilot.autoPricing.surgeMultiplier;
      }
    }
    
    // Update price
    sellerProduct.sellerPrice = Math.round(newPrice);
    await sellerProduct.save();
    
    autoPilot.stats.priceAdjustments += 1;
    await autoPilot.save();
    
    return newPrice;
  }
  
  // Gamification: Check and award achievements
  static async checkAchievements(sellerId: string): Promise<string[]> {
    const performance = await SellerPerformance.findOne({ sellerId });
    if (!performance) return [];
    
    let achievement = await SellerAchievement.findOne({ sellerId });
    if (!achievement) {
      achievement = await SellerAchievement.create({ sellerId, badges: [], achievements: {} });
    }
    
    const newBadges: string[] = [];
    
    // First Order
    if (!achievement.achievements.firstOrder && performance.totalOrders >= 1) {
      achievement.achievements.firstOrder = true;
      achievement.badges.push({
        name: 'First Order',
        icon: '🌟',
        description: 'Completed your first order',
        category: 'orders',
        earnedAt: new Date()
      } as any);
      newBadges.push('First Order');
    }
    
    // 50 Orders
    if (!achievement.achievements.orders50 && performance.totalOrders >= 50) {
      achievement.achievements.orders50 = true;
      achievement.badges.push({
        name: 'Half Century',
        icon: '🔥',
        description: 'Completed 50 orders',
        category: 'orders',
        earnedAt: new Date()
      } as any);
      newBadges.push('Half Century');
    }
    
    // Quality King
    if (!achievement.achievements.qualityKing && 
        performance.totalOrders >= 100 && 
        performance.totalComplaints === 0) {
      achievement.achievements.qualityKing = true;
      achievement.badges.push({
        name: 'Quality King',
        icon: '💎',
        description: '100 orders with zero complaints',
        category: 'quality',
        earnedAt: new Date()
      } as any);
      achievement.rewards.bonusEarned += 5000;
      newBadges.push('Quality King');
    }
    
    // Speed Demon
    if (!achievement.achievements.speedDemon && performance.avgResponseTime <= 2) {
      achievement.achievements.speedDemon = true;
      achievement.badges.push({
        name: 'Speed Demon',
        icon: '⚡',
        description: 'Average response time under 2 minutes',
        category: 'speed',
        earnedAt: new Date()
      } as any);
      newBadges.push('Speed Demon');
    }
    
    await achievement.save();
    return newBadges;
  }
  
  // Business Intelligence: Generate insights
  static async generateInsights(sellerId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'daily') startDate.setDate(now.getDate() - 1);
    else if (period === 'weekly') startDate.setDate(now.getDate() - 7);
    else startDate.setMonth(now.getMonth() - 1);
    
    // Get orders
    const orders = await Order.find({
      'items.sellerId': sellerId,
      createdAt: { $gte: startDate }
    }).lean();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o: any) => {
      const sellerItems = o.items.filter((i: any) => i.sellerId?.toString() === sellerId);
      return sum + sellerItems.reduce((s: number, i: any) => s + (i.sellerPrice || i.price) * i.quantity, 0);
    }, 0);
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get commission paid
    const commissionPaid = orders.reduce((sum, o: any) => {
      const sellerItems = o.items.filter((i: any) => i.sellerId?.toString() === sellerId);
      return sum + sellerItems.reduce((s: number, i: any) => s + (i.commissionAmount || 0), 0);
    }, 0);
    
    const netProfit = totalRevenue - commissionPaid;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Forecast next period
    const growthRate = 15; // Simplified
    const nextPeriodRevenue = totalRevenue * (1 + growthRate / 100);
    
    // Recommendations
    const recommendations = [];
    
    if (profitMargin < 80) {
      recommendations.push({
        type: 'pricing',
        priority: 'high',
        message: 'Your profit margin is below 80%',
        impact: 'Increase profit by 10%',
        action: 'Review pricing strategy'
      });
    }
    
    if (totalOrders < 50) {
      recommendations.push({
        type: 'marketing',
        priority: 'medium',
        message: 'Low order volume',
        impact: 'Increase orders by 30%',
        action: 'Lower prices or improve visibility'
      });
    }
    
    // Save insights
    const insights = await SellerInsights.create({
      sellerId,
      period,
      date: now,
      sales: { totalOrders, totalRevenue, avgOrderValue },
      profit: { grossProfit: totalRevenue, commissionPaid, netProfit, profitMargin },
      forecast: { nextPeriodRevenue, growthRate, confidence: 75 },
      recommendations
    });
    
    return insights;
  }
  
  // Smart Notifications
  static async generateSmartAlerts(sellerId: string): Promise<any[]> {
    const alerts = [];
    
    // Low stock alert
    const products = await SellerProduct.find({ sellerId, isActive: true });
    for (const product of products) {
      if (product.stock < 10) {
        alerts.push({
          type: 'critical',
          title: 'Low Stock Alert',
          message: `${product.productId} has only ${product.stock} units left`,
          action: 'Restock now'
        });
      }
    }
    
    // Price alert
    const performance = await SellerPerformance.findOne({ sellerId });
    if (performance && performance.totalOrders < 20) {
      alerts.push({
        type: 'important',
        title: 'Low Orders',
        message: 'Your prices might be too high',
        action: 'Review pricing'
      });
    }
    
    return alerts;
  }
}
