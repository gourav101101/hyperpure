import { NextApiRequest } from 'next';
import { NextApiResponseServerIO, initSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method === 'POST') {
    const io = initSocket(res);
    const { room, event, data, events } = req.body;
    
    if (events && Array.isArray(events)) {
      events.forEach(({ room, event, data }) => {
        io.to(room).emit(event, data);
      });
    } else if (room && event) {
      io.to(room).emit(event, data);
    }
    
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
