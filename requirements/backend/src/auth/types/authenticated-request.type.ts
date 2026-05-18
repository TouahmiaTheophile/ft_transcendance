import { Request } from 'express';

export interface AuthenticatedRequest<T = any> extends Request {
  user: T;
}

export type RefreshRequestUser = {
  sessionId: string;
  sub: number;
  refreshToken: string;
};