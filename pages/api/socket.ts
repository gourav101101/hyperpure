import { NextApiRequest } from 'next';
import { NextApiResponseServerIO, initSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method === 'GET') {
    initSocket(res);
    res.status(200).json({ message: 'Socket.IO server initialized' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
