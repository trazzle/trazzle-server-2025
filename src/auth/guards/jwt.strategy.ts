import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { IJwtPayloads } from '../jwt-payloads.interface';
import { TrazzleUser } from '../trazzle-user.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
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
  async validate(payload: IJwtPayloads): Promise<TrazzleUser> {
    const { email, sub } = payload;
    const result = await this.authService.validateUser({ id: sub, email: email });
    return result;
  }
}
