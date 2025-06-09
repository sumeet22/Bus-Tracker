// src/trips/trip.module.ts
import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { BusService } from 'src/bus/bus.service';

@Module({
  controllers: [TripController],
  providers: [TripService, RealtimeGateway, BusService],
})
export class TripModule {}
