export async function sendNotification(data: {
  userType: 'admin' | 'seller' | 'customer';
  userId?: string;
  type: 'order' | 'payout' | 'seller' | 'product' | 'system';
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
