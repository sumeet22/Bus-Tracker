// src/trips/entities/trip.entity.ts
export interface Bus {
  id: string;
  name: string;
  capacity: number;
  wheelchairSlots: number;
  currentWheelchairAvailability: number;
  speed: number; // km/h
}

export interface Stop {
  id: string;
  name: string;
  scheduledArrival: string;
  location: {
    lat: number;
    lng: number;
  };
  distanceFromPrev: number; // km
}

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  startTime: string;
  stops: Stop[];
  currentStopIndex: number;
  wheelchairAvailable: boolean;
  lastUpdated: string;
}
