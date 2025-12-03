import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicAPI } from 'src/common/decorators/public-api.decorator';

@ApiTags('App Root')
@Controller()
export class AppController {
  @Get()
  @PublicAPI()
  @ApiOperation({ summary: 'Health-Check' })
  healthCheck() {
    return {
      health: 'true',
      date: new Date(),
    };
  }
}
