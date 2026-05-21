import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrors } from '../../common/errors/api-exceptions.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err, user, info) {

    if (err) {
      throw ApiErrors.unauthorized('Authentication failed');
    }

    if (!user) {

      if (info?.name === 'TokenExpiredError') {
        throw ApiErrors.unauthorized('Access token expired');
      }

      throw ApiErrors.unauthorized('Authentication required');
    }

    return user;
  }
}