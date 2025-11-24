import { ApiProperty } from '@nestjs/swagger';
import { ExposeAll } from '../../common/decorators/expose-all.decorator';
import { ExposeAllBaseResponseDto } from '../../common/dtos/base-response.dto';
import { IsOptional } from 'class-validator';
import { IsImageFile } from '../../common/decorators/is-image-file.decorator';

export class UpdateProfileRequestDto {
  @ApiProperty({
    description: '(수정) 업로드 프로필 이미지',
    example: '{profile-image-file}.{png/jpeg/webp/gif}',
  })
  @IsOptional()
  @IsImageFile()
  profileImageFile?: Express.Multer.File;
}

@ExposeAll()
export class UpdateProfileResponseDto extends ExposeAllBaseResponseDto {
  @ApiProperty({
    description: '(수정완료) 프로필 이미지 파일 S3 URI',
    example: '{S3-URI}/profiles/{userId}/{imageFileName}',
  })
  profile_image_url: string | null;
}
