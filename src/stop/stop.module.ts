// src/stops/stop.module.ts
import { Module } from '@nestjs/common';
import { StopController } from './stop.controller';
import { StopService } from './stop.service';

@Module({
  controllers: [StopController],
  providers: [StopService],
})
export class StopModule {}
