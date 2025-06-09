// src/buses/bus.module.ts
import { Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';

@Module({
  controllers: [BusController],
  providers: [BusService],
  exports: [BusService], // used in TripService later
})
export class BusModule {}
