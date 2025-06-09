import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusModule } from './bus/bus.module';
import { TripModule } from './trip/trip.module';
import { StopModule } from './stop/stop.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [BusModule, TripModule, StopModule, RealtimeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
