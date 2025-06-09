// import { TestingModule } from '@nestjs/testing';
// import { StopController } from './stop.controller';
// import { StopService } from './stop.service';

// // test/stops/stop.controller.spec.ts
// describe('StopController', () => {
//   let controller: StopController;
//   let service: StopService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [StopController],
//       providers: [StopService],
//     }).compile();

//     controller = module.get<StopController>(StopController);
//     service = module.get<StopService>(StopService);
//   });

//   it('should return nearby stops', () => {
//     const result = controller.getNearby(40.71, -74.01, 1);
//     expect(result.length).toBeGreaterThan(0);
//     expect(result[0]).toHaveProperty('amenities');
//   });
// });
