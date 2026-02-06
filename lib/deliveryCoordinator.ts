import DeliveryPartner from '@/models/DeliveryPartner';
import Order from '@/models/Order';
import Seller from '@/models/Seller';

export class DeliveryCoordinator {
  
  static async assignDelivery(orderId: string, sellerLocation: any, deliveryLocation: any): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    
    const distance = this.calculateDistance(
      sellerLocation.latitude,
      sellerLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );
    
    // Decide delivery method based on distance
    if (distance <= 5) {
      // Seller self-delivery
      return {
        method: 'self_delivery',
        partnerId: null,
        estimatedTime: Math.round(distance * 12), // 12 min per km
        instructions: 'Seller will deliver using own logistics'
      };
    } else {
      // Use logistics partner
      const partner = await this.findBestPartner(sellerLocation, deliveryLocation);
      
      if (partner) {
        order.deliveryPartnerId = partner._id;
        order.deliveryStatus = 'assigned';
        await order.save();
        
        return {
          method: 'logistics_partner',
          partnerId: partner._id,
          partnerName: partner.name,
          partnerType: partner.type,
          estimatedTime: Math.round(distance * 8), // 8 min per km
          instructions: 'Logistics partner will pickup from seller'
        };
      }
      
      return {
        method: 'self_delivery',
        partnerId: null,
        estimatedTime: Math.round(distance * 12),
        instructions: 'No partner available - seller delivery'
      };
    }
  }
  
  static async findBestPartner(pickupLocation: any, deliveryLocation: any): Promise<any> {
    const availablePartners = await DeliveryPartner.find({
      isActive: true,
      isAvailable: true
    }).lean();
    
    if (availablePartners.length === 0) return null;
    
    // Score partners based on proximity and rating
    const scoredPartners = availablePartners.map((partner: any) => {
      let score = 0;
      
      // Rating (50 points)
      score += (partner.rating / 5) * 50;
      
      // Proximity (50 points)
      if (partner.currentLocation?.latitude) {
        const distance = this.calculateDistance(
          partner.currentLocation.latitude,
          partner.currentLocation.longitude,
          pickupLocation.latitude,
          pickupLocation.longitude
        );
        score += Math.max(0, 50 - distance * 5);
      }
      
      return { ...partner, score };
    });
    
    scoredPartners.sort((a, b) => b.score - a.score);
    return scoredPartners[0];
  }
  
  static async coordinateMultiSellerDelivery(orderId: string): Promise<any> {
    const order = await Order.findById(orderId).populate('items.sellerId');
    if (!order) throw new Error('Order not found');
    
    // Group items by seller
    const sellerGroups = new Map();
    order.items.forEach((item: any) => {
      const sellerId = item.sellerId._id.toString();
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, {
          seller: item.sellerId,
          items: []
        });
      }
      sellerGroups.get(sellerId).items.push(item);
    });
    
    const deliveries = [];
    
    for (const [sellerId, group] of sellerGroups.entries()) {
      const delivery = await this.assignDelivery(
        orderId,
        { latitude: 0, longitude: 0 }, // Would get from seller profile
        order.deliveryAddress
      );
      
      deliveries.push({
        sellerId,
        items: (group as any).items.length,
        ...delivery
      });
    }
    
    return {
      totalDeliveries: deliveries.length,
      deliveries,
      estimatedTotalTime: Math.max(...deliveries.map(d => d.estimatedTime))
    };
  }
  
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
