import { Test, TestingModule } from '@nestjs/testing';
import { StopService } from './stop.service';
import { NotFoundException } from '@nestjs/common';

describe('StopService', () => {
  let service: StopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StopService],
    }).compile();

    service = module.get<StopService>(StopService);
  });

  it('should find stop by ID', () => {
    const stop = service.findById('S1');
    expect(stop.id).toBe('S1');
  });

  it('should search stops by name', () => {
    const stops = service.findByName('central');
    expect(stops.length).toBeGreaterThan(0);
    expect(stops[0].name.toLowerCase()).toContain('central');
  });

  it('should find nearby stops', () => {
    const stops = service.getNearbyStops(40.7128, -74.0060);
    expect(stops.length).toBeGreaterThan(0);
    expect(stops[0].id).toBe('S1');
  });

  it('should throw NotFoundException for invalid stop ID', () => {
    expect(() => service.findById('INVALID')).toThrow(NotFoundException);
  });
});
