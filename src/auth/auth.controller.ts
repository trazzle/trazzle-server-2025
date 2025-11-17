import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('kakao')
  requestKakao(@Req() req: Request, @Res() res: Response) {
    const redirect_uri = this.config.get<string>('app.kakaoRedirectUri')!;
    const client_id = this.config.get<string>('app.kakaoRestApiKey')!;

    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=profile_nickname,account_email&prompt=none`;
    return res.redirect(url);
  }

  @Get('sign-in/kakao')
  @ApiOperation({ summary: '카카오 연동 로그인 인가코드 요청 Redirect URI' })
  async signInWithKakao(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const kakaoAccessToken = await this.authService.requestKakaoAccessToken(code);
    const kakaoUserInfo = await this.authService.requestKakaoUserInfo(kakaoAccessToken);
    const { accessToken, refreshToken } = await this.authService.signedWithKakao({
      email: kakaoUserInfo.email,
      name: kakaoUserInfo.name,
    });

    // if (!accessToken || !refreshToken) {
    //   // 회원가입상태라면 클라이언트 로그인화면 URI로 리다이렉트
    //   // return res.redirect();
    // }

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  @Post('sign-in/google')
  @ApiOperation({ summary: '구글 로그인 리다이렉트 URL' })
  async signInWithGoogle() {}

  @Post('sign-out')
  @ApiOperation({ summary: '로그아웃' })
  async signOut() {}

  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 리프래시' })
  async refresh() {}
}
