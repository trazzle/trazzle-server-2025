import { ApiProperty } from '@nestjs/swagger';
import { ExposeAll } from '../../common/decorators/expose-all.decorator';
import { ISignInResponse } from './sign-in.interface.dto';
import { ExposeAllBaseResponseDto } from '../../common/dtos/base-response.dto';

@ExposeAll()
export class SignInWithKakaoResponseDto
  extends ExposeAllBaseResponseDto
  implements ISignInResponse
{
  @ApiProperty({
    description: 'Trazzle 서비스 액세스 토큰 (유효시간: 1시간)',
    example: '{your-access-token}',
  })
  access_token: string;

  @ApiProperty({
    description: 'Trazzle 서비스 리프래시 토큰 (유효시간: 7일)',
    example: '{your-refresh-token}',
  })
  refresh_token: string;
}
