// src/stops/stop.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Stop } from './entities/stop.entity';
import { mockDB } from 'src/db/mock-db';

@Injectable()
export class StopService {
  findAll(): Stop[] {
    return mockDB.stops;
  }

  findById(id: string): Stop {
    const stop = mockDB.stops.find((s) => s.id === id);
    if (!stop) throw new NotFoundException(`Stop ${id} not found`);
    return stop;
  }

  findByName(searchTerm: string): Stop[] {
    console.log(searchTerm);

    const result = mockDB.stops.filter((s) =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // console.log(result);
    return result;
  }

  getNearbyStops(lat: number, lng: number, radiusKm = 1): Stop[] {
    // Mock implementation - real app would use geospatial query
    return mockDB.stops.filter((stop) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        stop.location.lat,
        stop.location.lng,
      );
      return distance <= radiusKm;
    });
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // Simplified Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
