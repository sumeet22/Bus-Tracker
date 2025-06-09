import { mockDB } from '../db/mock-db';
import { BusService } from './bus.service';

describe.only('BusService', () => {
  let service: BusService;

  beforeEach(() => {
    service = new BusService();
  });

  it('should return all buses', () => {
    expect(service.findAll().length).toBe(mockDB.buses.length);
  });

  it('should return a bus by id', () => {
    expect(service.findById('1').name).toBe('Bus A');
  });

  it('should throw if bus not found', () => {
    expect(() => service.findById('999')).toThrow();
  });

  it('should create a new bus', () => {
    const newBus = service.create({
      name: 'Bus C',
      capacity: 40,
      wheelchairSlots: 1,
      currentWheelchairAvailability: 1,
    });
    expect(newBus.id).toBeDefined();
  });

  it('should update wheelchair slots correctly', () => {
    const updated = service.updateWheelchairSlots('1', 1);
    expect(updated.currentWheelchairAvailability).toBe(1);
  });
});
