import { HttpService } from '@nestjs/axios';
import {
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

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    @Inject(USERS)
    private readonly userRepository: IUsersRepository,
    @Inject(USERS_CACHE)
    private readonly usersCacheRepository: IUsersCacheRepository,
  ) {}

  /**
   * 로그인 유저 확인
   *
   * @param id - 유저 고유 ID
   * @returns 유저정보
   */
  async validateUser(id: number) {
    // tbd: 캐시히트일경우
    // 캐시미스일경우
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UnAuthenticatedUserException();
    }
    return user;
  }

  /**
   * 카카오 인증서버에게 토큰정보 요청하여 액세스토큰을 얻는다
   *
   * @param code - 인가코드
   * @returns 카카오 토큰정보
   */
  async requestKakaoAccessToken(code: string): Promise<string> {
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
    const user = await this.userRepository.findOneByEmail(dto.email);

    if (!user) {
      await this.generateNewUser(dto);
      // tbd: 회원가입이 완료되면 해당계정으로 메일을 전송한다.
      return {
        accessToken: null,
        refreshToken: null,
      };
    }

    const accessToken = await this.generateAccessToken({
      userId: user.id,
      email: user.email,
    } as IJwtPayloads);
    const refreshToken = await this.generateRefreshToken({
      userId: user.id,
      email: user.email,
    } as IJwtPayloads);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 멤버계정 생성
   * @param params.email - 이메일 계정
   * @param params.name - 이름
   * @returns 신규계정 정보
   */
  private async generateNewUser(dto: { email: string; name: string }) {
    return await this.userRepository.create({ name: dto.name, email: dto.email });
  }

  private async generateAccessToken(payload: IJwtPayloads) {
    const accessToken = await this.jwt.signAsync(
      { sub: payload.userId, email: payload.email },
      {
        expiresIn: this.config.get<string>('app.jwtExpiration')! as any,
      },
    );
    await this.usersCacheRepository.setUserAccessToken(payload.userId, accessToken);
    return accessToken;
  }

  private async generateRefreshToken(paylaod: IJwtPayloads) {
    const refreshToken = await this.jwt.signAsync(
      { sub: paylaod.userId, email: paylaod.email },
      {
        secret: this.config.get<string>('app.jwtRefreshSecret'),
        expiresIn: this.config.get<string>('app.jwtRefreshExpiration') as any,
      },
    );
    await this.usersCacheRepository.setUserRefreshToken(paylaod.userId, refreshToken);
    return refreshToken;
  }
}
