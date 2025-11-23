import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health-Check' })
  healthCheck() {
    return {
      health: 'true',
      date: new Date(),
    };
  }
}
