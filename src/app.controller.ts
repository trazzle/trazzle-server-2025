import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      health: 'true',
      date: new Date(),
    };
  }
}
