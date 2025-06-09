// src/realtime/realtime.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // enable CORS for local testing
export class RealtimeGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Unified method for all realtime updates
  sendUpdate(eventType: 'trip' | 'route', id: string, data: any) {
    const channel = `${eventType}-${id}`;
    this.server.emit(channel, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  sendTripUpdate(tripId: string, data: any) {
    this.server.emit(`trip-${tripId}`, data);
    // Also broadcast to route channel
    this.server.emit(`route-updates`, { tripId, ...data });
    this.sendUpdate('trip', tripId, data);
  }
}
