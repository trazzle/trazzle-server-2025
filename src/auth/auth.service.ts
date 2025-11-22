import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IUsersRepository, USERS } from '../users/users.repository.interface';
import { UnAuthenticatedUserException } from './errors/unauthenticated-user.exception';
import { ConfigService } from '@nestjs/config';
import { InvalidTokenException } from './errors/invalid-token.exception';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayloads } from './jwt-payloads.interface';
import { IUsersCacheRepository, USERS_CACHE } from '../users/users.cache-repository.interface';
import { URLSearchParams } from 'url';
import { OAuth2Client } from 'google-auth-library';
import * as crypto from 'crypto';
import { TrazzleUser } from './trazzle-user.interface';

@Injectable()
export class AuthService {
  private googleOAuthClient: OAuth2Client;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    @Inject(USERS)
    private readonly userRepository: IUsersRepository,
    @Inject(USERS_CACHE)
    private readonly usersCacheRepository: IUsersCacheRepository,
  ) {
    this.googleOAuthClient = new OAuth2Client({
      clientId: this.config.get<string>('app.googleClientId')!,
      clientSecret: this.config.get<string>('app.googleClientSecretPassword')!,
      redirectUri: this.config.get<string>('app.googleRedirectUri')!,
    });
  }

  /**
   * 로그인 유저 확인
   *
   * @param id - 유저 고유 ID
   * @returns 유저정보
   */
  async validateUser(dto: { id: number; email: string }): Promise<TrazzleUser> {
    // tbd: 캐시히트일경우

    // 캐시미스일경우
    const user = await this.userRepository.findOneById(dto.id);
    if (!user || user.email !== dto.email) {
      throw new UnAuthenticatedUserException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    } as TrazzleUser;
  }

  /**
   * 로그아웃
   *
   * @param id - 유저 고유 ID
   */
  async signOut(id: number) {
    await this.deleteAccessToken(id);
    await this.deleteRefreshToken(id);
  }

  /**
   * 카카오 인증서버에게 토큰정보 요청하여 액세스토큰을 얻는다
   *
   * @param code - 인가코드
   * @returns 카카오 토큰정보
   */
  async requestKakaoAccessToken(code: string): Promise<string> {
    if (!code) throw new BadRequestException('소셜연동로그인 인가코드를 얻는데 실패하였습니다.');

    const clientId = this.config.get<string>('app.kakaoRestApiKey')!;
    const redirectUri = this.config.get<string>('app.kakaoRedirectUri')!;
    const clientSecret = this.config.get<string>('app.kakaoClientSecretKey')!;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code,
      client_secret: clientSecret, // 누락시 'KOE010' 코드의 에러가 발생
    });

    try {
      const { data } = await firstValueFrom(
        this.http.post('https://kauth.kakao.com/oauth/token', params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }),
      );

      const accessToken = data?.access_token;
      if (typeof accessToken !== 'string') {
        throw new InvalidTokenException();
      }
      return accessToken;
    } catch (error) {
      if (error.response?.data?.error_code === 'KOE010') {
        throw new UnauthorizedException(error.response?.data?.error);
      }
      if (error.response.status === 400) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * 카카오톡 액세스토큰을 활용하여 카카오 유저정보를 가져온다.
   * @param kakaoAccessToken - 카카오톡 액세스토큰
   * @returns 카카오 유저계정 정보
   */
  async requestKakaoUserInfo(kakaoAccessToken: string) {
    const { data } = await firstValueFrom(
      this.http.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${kakaoAccessToken}`,
        },
      }),
    );

    const { email, profile } = data.kakao_account;
    const { nickname } = profile;
    return {
      email: email,
      name: nickname,
    };
  }

  /**
   * 카카오톡으로 소셜 연동로그인 및 회원가입(최초 연동로그인)
   * @param dto
   * @returns 이용 회원 - 서비스 액세스토큰, 리프래시 토큰
   * @returns 최초 가입 - 회원가입만 진행. 토큰 없음.
   */
  async signedWithKakao(dto: { email: string; name: string }) {
    let user = await this.userRepository.findOneByEmail(dto.email);

    if (!user) {
      user = await this.generateNewUser(dto);
      // // tbd: 회원가입이 완료되면 해당계정으로 메일을 전송한다.
      // return {
      //   accessToken: null,
      //   refreshToken: null,
      // };
    }

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
    } as IJwtPayloads);
    const refreshToken = await this.generateRefreshToken({
      sub: user.id,
      email: user.email,
    } as IJwtPayloads);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 구글 로그인 URL 요청
   * @returns
   */
  getAuthenticateUri() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email', // 기본 google 계정 이메일주소 조회
      'https://www.googleapis.com/auth/userinfo.profile', // 공개로 설정한 개인정보 전부 조회
    ];

    const state = crypto.randomBytes(32).toString('hex');
    const authorizeUrl = this.googleOAuthClient.generateAuthUrl({
      access_type: 'offline', // 브라우저 없을때 애플리케이션이 액세스토큰을 새로고침할 수 있는 여부
      response_type: 'code',
      scope: scopes,
      state: state, // redirect_uri cross-site 요청위조 공격을 막기위해서
    });
    return authorizeUrl;
  }

  /**
   * 구글 OAuth인증 서버에게 토큰정보를 요청하여 액세스토큰을 얻는다.
   * @param dto
   * @returns
   */
  async requestGoogleAccessToken(dto: { code: string; state: string }) {
    const { code } = dto;
    if (!code) throw new BadRequestException('소셜연동로그인 인가코드를 얻는데 실패하였습니다.');

    const { tokens } = await this.googleOAuthClient.getToken(code);
    if (!tokens || !tokens.access_token) {
      throw new InvalidTokenException('구글 계정 액세스토큰을 얻는데 실패하였습니다.');
    }

    const { access_token } = tokens;
    this.googleOAuthClient.setCredentials(tokens);

    return access_token;
  }

  /**
   * 구글 액세스토큰을 활용하여 구글 로그인된 유저의 정보를 얻는다.
   * @param googleAccessToken
   * @returns
   */
  async requestGoogleUserInfo(googleAccessToken: string) {
    const { data } = await firstValueFrom(
      this.http.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }),
    );

    return {
      email: data.email,
      name: data.name,
    };
  }

  async signedWithGoogle(dto: { email: string; name: string }) {
    let user = await this.userRepository.findOneByEmail(dto.email);
    if (!user) {
      user = await this.generateNewUser(dto);
    }
    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = await this.generateRefreshToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 멤버계정 생성
   * - 활용: 회원가입(초기 소셜연동 로그인)
   * @param params.email - 이메일 계정
   * @param params.name - 이름
   * @returns 신규계정 정보
   */
  private async generateNewUser(dto: { email: string; name: string }) {
    return await this.userRepository.create({ name: dto.name, email: dto.email });
  }

  /**
   * 액세스 토큰 생성
   *
   * @param payload - 로그인 유저 정보
   *
   * - 활용: 로그인
   * @returns 액세스 토큰
   */
  private async generateAccessToken(payload: IJwtPayloads) {
    const accessToken = await this.jwt.signAsync(
      { sub: payload.sub, email: payload.email },
      {
        expiresIn: this.config.get<string>('app.jwtExpiration')! as any,
      },
    );
    await this.usersCacheRepository.setUserAccessToken(payload.sub, accessToken);
    return accessToken;
  }

  /**
   * 액세스토큰 캐시데이터 제거하기
   *
   * - 활용: 로그아웃
   * @param payload  - 로그인 유저 정보
   */
  private async deleteAccessToken(id: number) {
    await this.usersCacheRepository.delUserAccessToken(id);
  }

  /**
   * 로그인 유저 정보
   */
  private async generateSignInUserCache(accessToken: string, value: TrazzleUser) {
    await this.usersCacheRepository.setSignInUserInfo(accessToken, value);
  }

  /**
   * 리프래시 토큰 생성
   *
   * - 활용: 로그인
   * @param paylaod - 로그인 유저 정보
   * @returns 리프래시 토큰
   */
  private async generateRefreshToken(paylaod: IJwtPayloads) {
    const refreshToken = await this.jwt.signAsync(
      { sub: paylaod.sub, email: paylaod.email },
      {
        secret: this.config.get<string>('app.jwtRefreshSecret'),
        expiresIn: this.config.get<string>('app.jwtRefreshExpiration') as any,
      },
    );
    await this.usersCacheRepository.setUserRefreshToken(paylaod.sub, refreshToken);
    return refreshToken;
  }

  /**
   * 리프래시 토큰 캐시데이터 제거
   *
   * - 활용: 로그아웃
   * @param payload - 로그인 유저정보
   */
  private async deleteRefreshToken(id: number) {
    await this.usersCacheRepository.delUserRefreshToken(id);
  }
}
