// src/stops/entities/stop.entity.ts
export class Stop {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  amenities: string[];
}
