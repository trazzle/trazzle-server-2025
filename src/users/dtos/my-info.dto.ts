import { ApiProperty } from '@nestjs/swagger';
import { ExposeAll } from '../../common/decorators/expose-all.decorator';
import { ExposeAllBaseResponseDto } from '../../common/dtos/base-response.dto';

@ExposeAll()
export class MyInfoResonseDto extends ExposeAllBaseResponseDto {
  @ApiProperty({
    description: '유저 고유 식별자',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '유저 이름',
    example: '정희수',
  })
  name: string;

  @ApiProperty({
    description: '유저 소개문구',
    example: '희수의 세계 여행, 즐거웠던 기억을 기록해두자!',
  })
  intro: string | null;

  @ApiProperty({
    description: '프로필 이미지 S3 URL',
    example: '{your-profile-s3-url}',
  })
  profile_image: string | null;

  @ApiProperty({
    description: '여행 기록 개수',
    type: 'number',
    example: 12,
  })
  travel_stories: number;

  @ApiProperty({
    description: '유저가 방문한 국가 수',
    example: 10,
  })
  visited_countries: number;

  @ApiProperty({
    description: '전체 국가 대비 방문 국가 백분율(%)',
    example: 4.21,
  })
  visited_world_percentage: number;

  @ApiProperty({
    description: '수집한 마그넷 개수',
    example: 6,
  })
  magnets: number;
}
