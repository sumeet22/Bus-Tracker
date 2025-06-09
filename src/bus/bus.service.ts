// src/buses/bus.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bus } from './entities/bus.entity';
import { mockDB } from 'src/db/mock-db';

@Injectable()
export class BusService {
  getBusRef(id: string) {
    const bus = mockDB.buses.find((b) => b.id === id);
    if (!bus) throw new NotFoundException(`Bus ${id} not found`);
    return bus;
  }

  findById(id: string): Bus {
    const bus = this.getBusRef(id);
    return { ...bus }; // Return a copy
  }

  findAll(): Bus[] {
    return mockDB.buses;
  }

  findOne(id: string): Bus {
    const bus = mockDB.buses.find((bus) => bus.id === id);
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }

  create(bus: Omit<Bus, 'id'>): Bus {
    const newBus = {
      id: (mockDB.buses.length + 1).toString(), // Auto-generate ID
      ...bus,
    };
    mockDB.buses.push(newBus);
    return newBus;
  }

  update(id: string, updateBus: Partial<Bus>): Bus {
    const busIndex = mockDB.buses.findIndex((bus) => bus.id === id);
    if (busIndex === -1) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    const updatedBus = { ...mockDB.buses[busIndex], ...updateBus };
    mockDB.buses[busIndex] = updatedBus;
    return updatedBus;
  }

  remove(id: string): { deleted: boolean; message?: string } {
    const initialLength = mockDB.buses.length;
    mockDB.buses = mockDB.buses.filter((bus) => bus.id !== id);
    if (mockDB.buses.length === initialLength) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return { deleted: true };
  }
  updateWheelchairSlots(busId: string, occupiedSlots: number): Bus {
    const bus = this.findOne(busId);

    if (occupiedSlots > bus.wheelchairSlots) {
      throw new BadRequestException('Not enough wheelchair slots');
    }

    bus.currentWheelchairAvailability = bus.wheelchairSlots - occupiedSlots;
    return bus;
  }
}
