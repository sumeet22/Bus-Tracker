// src/buses/entities/bus.entity.ts
export class Bus {
  id: string;
  name: string;
  capacity: number;
  wheelchairSlots: number;
  currentWheelchairAvailability: number;
  speed: number; // km/h
}
