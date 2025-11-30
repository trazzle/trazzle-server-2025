import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/common/decorators/is-public.decorator';

@ApiTags('App Root')
@Controller()
export class AppController {
  @Get()
  @IsPublic()
  @ApiOperation({ summary: 'Health-Check' })
  healthCheck() {
    return {
      health: 'true',
      date: new Date(),
    };
  }
}
