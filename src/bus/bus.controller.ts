// src/buses/bus.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BusService } from './bus.service';
import { Bus } from './entities/bus.entity';

@Controller('buses')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Get()
  findAll(): Bus[] {
    return this.busService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Bus {
    return this.busService.findOne(id);
  }

  @Post()
  create(@Body() bus: Bus): Bus {
    return this.busService.create(bus);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBus: Partial<Bus>): Bus {
    return this.busService.update(id, updateBus);
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    this.busService.remove(id);
  }
}
