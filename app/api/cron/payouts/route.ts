// Automated Payout Generation Cron Job
// Run this every Monday at 00:00 to generate payouts for the previous week

import { getBaseUrl } from '@/lib/getBaseUrl';

const ADMIN_API_URL = getBaseUrl();

async function generateWeeklyPayouts() {
  try {
    console.log('[CRON] Starting weekly payout generation...');

    if (!ADMIN_API_URL) {
      throw new Error('ADMIN_API_URL is not configured for production.');
    }

    const response = await fetch(`${ADMIN_API_URL}/api/admin/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}` // Add auth for security
      },
      body: JSON.stringify({
        action: 'generate'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`[CRON] ✅ Generated ${data.count} payouts successfully`);
      return { success: true, count: data.count };
    } else {
      console.error('[CRON] ❌ Failed to generate payouts:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('[CRON] ❌ Error:', error);
    return { success: false, error: String(error) };
  }
}

// For Vercel Cron Jobs
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const result = await generateWeeklyPayouts();
  return Response.json(result);
}

// For manual execution or other platforms
if (require.main === module) {
  generateWeeklyPayouts().then(() => process.exit(0));
}

export default generateWeeklyPayouts;
