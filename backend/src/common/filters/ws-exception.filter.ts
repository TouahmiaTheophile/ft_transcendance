import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ErrorCode } from '@shared/errors/error-codes';

type WsExceptionPayload = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

// Normalizes all WsExceptions into a structured error event
// matching the APIErrorResponse shape used by REST routes.
// Applied globally in main.ts — covers all gateways automatically.
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    const raw = exception.getError();

    let payload: WsExceptionPayload;

    if (typeof raw === 'object' && raw !== null && 'code' in raw) {
      // Already structured — cast directly
      payload = raw as WsExceptionPayload;
    } else {
      // Plain string message — wrap with generic code
      payload = {
        code: 'BAD_REQUEST',
        message: typeof raw === 'string' ? raw : 'WebSocket error',
        details: null,
      };
    }

    client.emit('exception', {
      code: payload.code,
      message: payload.message,
      details: payload.details ?? null,
      timestamp: new Date().toISOString(),
    });
  }
}