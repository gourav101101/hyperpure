import { Server as SocketIOServer } from 'socket.io';
import { NextRequest } from 'next/server';

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = (global as any).httpServer;
    if (httpServer) {
      io = new SocketIOServer(httpServer, {
        path: '/api/socket/io',
        cors: { origin: '*', methods: ['GET', 'POST'] }
      });

      io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);
        socket.on('join', ({ userId, userType }) => {
          socket.join(`${userType}-${userId}`);
        });
      });
    }
  }
  return new Response('Socket.IO initialized', { status: 200 });
}
