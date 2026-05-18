import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import { AccessTokenPayload }
  from '../types/access-token-payload.type';

export const CurrentUser =
  createParamDecorator(
    (_: unknown, ctx: ExecutionContext)
      : AccessTokenPayload => {

      const request =
        ctx.switchToHttp().getRequest();

      return request.user;
    },
  );