import { BusService } from "src/bus/bus.service";
import { TripService } from "./trip.service";
import { RealtimeGateway } from "src/realtime/realtime.gateway";

const gateway = new RealtimeGateway();
const busService = new BusService();
const tripService = new TripService(gateway, busService);

describe.only('TripService', () => {
  it('should find trip by ID', () => {
    const trip = tripService.findById('T1');
    expect(trip.busId).toBe('1');
  });

  it('should throw if invalid trip ID', () => {
    expect(() => tripService.findById('XYZ')).toThrow();
  });

  it('should update wheelchair availability', () => {
    const trip = tripService.updateWheelchairAvailability('T1', false);
    expect(trip.wheelchairAvailable).toBe(false);
  });

  it('should progress to next stop', () => {
    const trip = tripService.updateTripProgress('T1');
    expect(trip.currentStopIndex).toBe(1);
  });
});
