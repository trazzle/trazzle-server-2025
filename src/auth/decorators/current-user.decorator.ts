import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TrazzleUser } from '../trazzle-user.interface';
import { Request } from 'express';
import { InvalidUserException } from '../errors/invalid-user.exception';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TrazzleUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) throw new InvalidUserException();

    return {
      ...(request.user as TrazzleUser),
    };
  },
);
