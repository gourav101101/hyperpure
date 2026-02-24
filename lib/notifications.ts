export async function sendNotification(data: {
  userType: 'admin' | 'seller' | 'customer';
  userId?: string;
  phoneNumber?: string;
  email?: string;
  type: 'order' | 'payout' | 'seller' | 'product' | 'system';
  title: string;
  message: string;
  orderId?: string;
  link?: string;
}) {
  try {
    console.log('📤 Sending notification:', { userType: data.userType, title: data.title });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Notification send failed:', result);
      return { success: false, error: result };
    }
    
    console.log('✅ Notification sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return { success: false, error };
  }
}
