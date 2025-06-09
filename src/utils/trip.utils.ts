// src/utils/trip.utils.ts
import { Stop, Trip } from 'src/trip/entities/trip.entity';
import { mockDB } from '../db/mock-db';

// src/utils/trip.utils.ts
export function getTripStatus(tripId: string): Trip & {
  etaToNextStop: number;
  distanceToNextStop: number;
  currentStop: Stop | null;
  nextStop: Stop | null;
  remainingSlots: number;
  totalSlots: number;
} {
  const trip = mockDB.trips.find((t) => t.id === tripId);
  if (!trip) throw new Error(`Trip ${tripId} not found`);

  const bus = mockDB.buses.find((b) => b.id === trip.busId);
  if (!bus) throw new Error(`Bus for trip ${tripId} not found`);

  const currentStop = trip.stops[trip.currentStopIndex];
  const nextStopIndex = trip.currentStopIndex + 1;
  const nextStop =
    nextStopIndex < trip.stops.length ? trip.stops[nextStopIndex] : null;

  // Calculate distance and ETA
  const distanceToNextStop = nextStop?.distanceFromPrev || 0;
  const etaToNextStop = nextStop
    ? Math.round((distanceToNextStop / bus.speed) * 60)
    : 0;

  return {
    ...trip,
    stops: trip.stops.map((s) => ({
      id: s.id,
      name: s.name,
      scheduledArrival: s.scheduledArrival,
      location: s.location,
      distanceFromPrev: s.distanceFromPrev, // Include required field
    })),
    currentStop: {
      ...currentStop,
      distanceFromPrev: currentStop.distanceFromPrev,
    },
    nextStop: nextStop
      ? {
          ...nextStop,
          distanceFromPrev: nextStop.distanceFromPrev,
        }
      : null,
    distanceToNextStop,
    etaToNextStop,
    remainingSlots: bus.currentWheelchairAvailability,
    totalSlots: bus.wheelchairSlots,
  };
}

// src/utils/trip.utils.ts
export function calculateETA(tripId: string): number {
  const trip = mockDB.trips.find((t) => t.id === tripId);
  if (!trip) throw new Error('Trip not found');

  const bus = mockDB.buses.find((b) => b.id === trip.busId);
  if (!bus) throw new Error('Bus not found');

  const nextStopIndex = trip.currentStopIndex + 1;
  if (nextStopIndex >= trip.stops.length) return 0; // End of route

  const currentStop = trip.stops[trip.currentStopIndex];
  const nextStop = trip.stops[nextStopIndex];

  // Calculate distance using Haversine formula
  const distance = calculateDistance(
    currentStop.location.lat,
    currentStop.location.lng,
    nextStop.location.lat,
    nextStop.location.lng,
  );

  // ETA in minutes (distance in km / speed in km/h * 60)
  return Math.round((distance / bus.speed) * 60);
}

// Helper function for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
