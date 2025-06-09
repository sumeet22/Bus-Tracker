// src/stops/stop.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { StopService } from './stop.service';
import { Stop } from './entities/stop.entity';

@Controller('stops')
export class StopController {
  constructor(private readonly stopService: StopService) {}

  @Get()
  findAll(): Stop[] {
    return this.stopService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Stop {
    return this.stopService.findById(id);
  }

  @Get('search/:name')
  findByName(@Param('name') name: string): Stop[] {
    return this.stopService.findByName(name);
  }

  @Get('nearby')
  getNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 1,
  ): Stop[] {
    return this.stopService.getNearbyStops(lat, lng, radius);
  }
}
