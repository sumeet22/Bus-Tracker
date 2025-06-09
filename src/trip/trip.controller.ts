// src/trips/trip.controller.ts
import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { TripService } from './trip.service';
import { Trip } from './entities/trip.entity';
import { getTripStatus } from 'src/utils/trip.utils';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  findAll(): Trip[] {
    return this.tripService.findAll();
  }
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return getTripStatus(id);
  }

  @Get(':id')
  findById(@Param('id') id: string): Trip {
    return this.tripService.findById(id);
  }

  @Get('route/:routeId')
  findByRoute(@Param('routeId') routeId: string): Trip[] {
    return this.tripService.findByRoute(routeId);
  }

  @Get(':routeId/upcoming')
  getUpcomingTrips(@Param('routeId') routeId: string) {
    return this.tripService.getUpcomingTrips(routeId);
  }

  @Post()
  create(@Body() trip: Omit<Trip, 'id'>): Trip {
    return this.tripService.create(trip);
  }

  @Put(':id/progress')
  updateProgress(@Param('id') id: string): Trip {
    return this.tripService.updateTripProgress(id);
  }

  @Put(':id/wheelchair')
  updateWheelchair(
    @Param('id') id: string,
    @Body() body: { available: boolean },
  ): Trip {
    return this.tripService.updateWheelchairAvailability(id, body.available);
  }
}
