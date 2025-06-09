import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeGateway } from './realtime.gateway';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeGateway],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    gateway.server = { emit: jest.fn() } as any;
  });

  it('should emit trip updates', () => {
    gateway.sendTripUpdate('T1', { wheelchairAvailable: true });
    expect(gateway.server.emit).toHaveBeenCalledWith(
      'trip-T1',
      expect.objectContaining({ wheelchairAvailable: true }),
    );
  });
});