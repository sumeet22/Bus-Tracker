// src/trips/trip.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mockDB } from '../db/mock-db';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { BusService } from '../bus/bus.service';
import { calculateETA, getTripStatus } from '../utils/trip.utils';
import { Bus, Stop, Trip } from './entities/trip.entity';

@Injectable()
export class TripService {
  constructor(
    private readonly realtimeGateway: RealtimeGateway,
    private readonly busService: BusService,
  ) {}

  // Helper to get direct reference to trip in mockDB
  private getTripRef(id: string): Trip {
    const trip = mockDB.trips.find((t) => t.id === id);
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return trip;
  }

  private mapStopForTrip(stop: any): Stop {
    return {
      id: stop.id,
      name: stop.name,
      arrivalTime: stop.scheduledArrival || stop.arrivalTime,
      ...(stop.location && { location: stop.location }),
      ...(stop.distanceFromPrev && { distanceFromPrev: stop.distanceFromPrev }),
    };
  }

  private mapTrip(trip: any): Trip {
    return {
      id: trip.id,
      busId: trip.busId,
      routeId: trip.routeId,
      startTime: trip.startTime || '08:00',
      stops: trip.stops.map(this.mapStopForTrip),
      currentStopIndex: trip.currentStopIndex,
      wheelchairAvailable: trip.wheelchairAvailable,
      lastUpdated: trip.lastUpdated || new Date().toISOString(),
    };
  }

  findAll(): Trip[] {
    return mockDB.trips;
  }

  findById(id: string): Trip {
    const trip = mockDB.trips.find((t) => t.id === id);
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return this.mapTrip(trip);
  }

  findByRoute(routeId: string): Trip[] {
    return mockDB.trips.filter((t) => t.routeId === routeId);
  }

  create(trip: Omit<Trip, 'id'>): Trip {
    const newTrip = this.mapTrip({
      id: `T${mockDB.trips.length + 1}`,
      ...trip,
      stops: trip.stops.map((stop) => ({
        ...stop,
        scheduledArrival: stop.scheduledArrival,
      })),
    });
    mockDB.trips.push(newTrip);
    return newTrip;
  }
  createBus(bus: Omit<Bus, 'id'>): Bus {
    const newBus: Bus = {
      id: `B${mockDB.buses.length + 1}`,
      ...bus,
    };
    mockDB.buses.push(newBus);
    return newBus;
  }

  getUpcomingTrips(routeId: string) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    return mockDB.trips
      .filter((trip) => trip.routeId.toLowerCase() === routeId.toLowerCase())
      .filter((trip) => {
        const [tripHours, tripMinutes] = trip.startTime.split(':').map(Number);

        // Compare hours first, then minutes
        return (
          tripHours > currentHours ||
          (tripHours === currentHours && tripMinutes >= currentMinutes)
        );
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 2)
      .map((trip) => ({
        ...getTripStatus(trip.id),
        startTime: trip.startTime, // Include start time in response
      }));
  }

updateTripProgress(tripId: string) {
  const trip = this.getTripRef(tripId);

  if (trip.currentStopIndex >= trip.stops.length - 1) {
    throw new BadRequestException('Already at final stop');
  }

  trip.currentStopIndex++;
  trip.lastUpdated = new Date().toISOString();
  
  // Now using the single-parameter version
  const eta = calculateETA(tripId);

  this.realtimeGateway.sendUpdate('trip', tripId, {
    type: 'progress',
    currentStop: trip.stops[trip.currentStopIndex],
    nextStop: trip.stops[trip.currentStopIndex + 1] || null,
    eta,
    wheelchairAvailable: trip.wheelchairAvailable
  });

    return getTripStatus(tripId);
}

  updateWheelchairAvailability(tripId: string, available: boolean): Trip {
    const trip = this.getTripRef(tripId);
    const bus = this.busService.findOne(trip.busId);

    if (!available && bus.currentWheelchairAvailability <= 0) {
      throw new ConflictException('No wheelchair slots available');
    }

    // Update wheelchair availability
    bus.currentWheelchairAvailability += available ? 1 : -1;
    trip.wheelchairAvailable = available;

    this.realtimeGateway.sendUpdate('trip', tripId, {
      type: 'wheelchair-update',
      wheelchairAvailable: available,
      remainingSlots: bus.currentWheelchairAvailability,
    });

    this.realtimeGateway.sendUpdate('route', trip.routeId, {
      type: 'wheelchair-update',
      tripId,
      wheelchairAvailable: available,
      remainingSlots: bus.currentWheelchairAvailability,
    });

    return getTripStatus(tripId);
  }
}
