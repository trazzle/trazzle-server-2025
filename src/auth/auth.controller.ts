import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import * as url from 'url';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInWithGoogleResponseDto } from './dtos/sign-in-with-google.dto';
import { SignInWithKakaoResponseDto } from './dtos/sign-in-with-kakao.dto';
import { TrazzleUser } from './trazzle-user.interface';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('sign-in/kakao')
  @IsPublic()
  @ApiOperation({ summary: '카카오 로그인 요청 (추후 클라이언트를 안드로이드로 변경예정)' })
  requestKakao(@Req() req: Request, @Res() res: Response) {
    const redirect_uri = this.config.get<string>('app.kakaoRedirectUri')!;
    const client_id = this.config.get<string>('app.kakaoRestApiKey')!;

    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=profile_nickname,account_email&prompt=select_account`;
    return res.redirect(url);
  }

  @Get('kakao/callback')
  @ApiOperation({ summary: '카카오 연동 로그인 인가코드 요청 Redirect URI' })
  @ApiQuery({ name: 'code', description: '인가 코드' })
  @ApiOkResponse({ description: '성공 응답', type: SignInWithKakaoResponseDto })
  async signInWithKakao(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const kakaoAccessToken = await this.authService.requestKakaoAccessToken(code);
    const kakaoUserInfo = await this.authService.requestKakaoUserInfo(kakaoAccessToken);
    const { accessToken, refreshToken } = await this.authService.signedWithKakao({
      email: kakaoUserInfo.email,
      name: kakaoUserInfo.name,
    });

    return res.status(HttpStatus.OK).json(
      SignInWithKakaoResponseDto.of({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    );
  }

  @Get('sign-in/google')
  @IsPublic()
  @ApiOperation({ summary: '구글 로그인 요청 (추후 클라이언트를 안드로이드로 변경 예정)' })
  requestGoogle(@Req() req: Request, @Res() res: Response) {
    // 클라이언트에서 Google OAuth URL 요청
    const url = this.authService.getAuthenticateUri();
    return res.redirect(url);
  }

  @Get('google/callback')
  @ApiOperation({ summary: '구글 로그인 리다이렉트 URI' })
  @ApiQuery({ name: 'code', description: '인가 코드' })
  @ApiQuery({ name: 'state', description: '상태 코드' })
  @ApiOkResponse({ description: '성공 응답', type: SignInWithGoogleResponseDto })
  async signInWithGoogle(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const q = url.parse(req.url, true).query;
    if (q.error) {
      throw new BadRequestException(`Error: ${q.error}`);
    }

    const googleAccessToken = await this.authService.requestGoogleAccessToken({
      code: code,
      state: state,
    });

    const { email, name } = await this.authService.requestGoogleUserInfo(googleAccessToken);
    const { accessToken, refreshToken } = await this.authService.signedWithGoogle({ email, name });

    return res.status(HttpStatus.OK).json(
      SignInWithGoogleResponseDto.of({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
    );
  }

  @Post('sign-out')
  @ApiOperation({ summary: '로그아웃' })
  @ApiNoContentResponse({ description: '성공 응답' })
  async signOut(@CurrentUser() user: TrazzleUser, @Res() res: Response) {
    await this.authService.signOut(user.id);
    return res.status(HttpStatus.NO_CONTENT).json();
  }

  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 리프래시' })
  async refresh() {}
}
