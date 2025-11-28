import { ApiProperty } from '@nestjs/swagger';
import { ExposeAll } from '../../common/decorators/expose-all.decorator';
import { ExposeAllBaseResponseDto } from '../../common/dtos/base-response.dto';

@ExposeAll()
export class MyTravelStatisticsResponseDto extends ExposeAllBaseResponseDto {
  @ApiProperty({
    description: '여행 기록 개수',
    type: 'number',
    example: 1,
  })
  travel_stories: number;

  @ApiProperty({
    description: '유저가 방문한 국가 수',
    example: 1,
  })
  visited_countries: number;

  @ApiProperty({
    description: '전체 국가 대비 방문 국가 백분율(%)',
    example: 0.42,
  })
  visited_world_percentage: number;
}
