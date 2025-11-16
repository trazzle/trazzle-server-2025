import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtUser } from '../jwt-user.interface';
import { Request } from 'express';
import { InvalidUserException } from '../errors/invalid-user.exception';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (!request.user) throw new InvalidUserException();

    return {
      ...(request.user as IJwtUser),
    };
  },
);
