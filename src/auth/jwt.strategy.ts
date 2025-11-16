import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IJwtPayloads } from './jwt-payloads.interface';
import { IJwtUser } from './jwt-user.interface';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * JWT 토큰이 유효할 때 호출되는 메서드
   *
   * @param payloads
   */
  async validate(payload: IJwtPayloads): Promise<IJwtUser> {
    const { userId } = payload;
    const user = await this.authService.validateUser(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    } as IJwtUser;
  }
}
