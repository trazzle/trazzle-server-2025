import { ApiProperty } from '@nestjs/swagger';
import { ExposeAllBaseResponseDto } from '../../common/dtos/base-response.dto';
import { ExposeAll } from '../../common/decorators/expose-all.decorator';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateMyInfoRequestDto {
  @ApiProperty({
    description: '(수정) 이름',
    example: '정희수',
  })
  @IsOptional()
  @IsString()
  @Min(1, { message: '최소 글자수는 1자 입니다.' })
  name?: string;

  @ApiProperty({
    description: '(수정) 소개문',
    example: '안녕하세요, 여행을 좋아하는 희수입니다!',
  })
  @IsOptional()
  @IsString()
  @Max(50, { message: '최대 글자수는 50자 입니다.' })
  intro?: string;
}

@ExposeAll()
export class UpdateMyInfoResponseDto extends ExposeAllBaseResponseDto {
  @ApiProperty({
    description: '(수정완료) 이름',
    example: '정희수',
  })
  name: string;

  @ApiProperty({
    description: '(수정완료) 소개문',
    example: '안녕하세요, 여행을 좋아하는 희수입니다!',
  })
  intro: string | null;
}
