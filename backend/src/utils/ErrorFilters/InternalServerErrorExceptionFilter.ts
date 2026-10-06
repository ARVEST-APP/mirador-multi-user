import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessTokenPayload } from '../../auth/access-token-payload';
import { EmailServerService } from '../email/email.service';
import { maskEmails } from '../email/utils';

interface AuthenticatedRequest extends Request {
  // absent on routes that AuthGuard does not protect (login, reset-password...)
  user?: AccessTokenPayload;
}

@Catch(InternalServerErrorException)
export class InternalServerErrorFilter implements ExceptionFilter {
  constructor(private readonly emailService: EmailServerService) {}

  async catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const status = exception.getStatus ? exception.getStatus() : 500;

    console.error('Internal server error:', exception.message);

    try {
      // The alert leaves the server by e-mail, so it does not quote the request:
      // the route's pattern ("/link-user-group/looking-for-user/:partialString"),
      // not the URL; the names of the body's fields, not their values; and the
      // user's id only. The error message is sent as the service wrote it.
      const body = request.body;
      await this.emailService.sendInternalServerErrorNotification({
        message: exception.message,
        route: request.route?.path ?? 'unknown route',
        method: request.method,
        timestamp: new Date().toISOString(),
        bodyFields:
          body && typeof body === 'object' && !Array.isArray(body)
            ? Object.keys(body)
            : [],
        userId: request.user?.sub,
        stack: exception.stack,
      });
    } catch (error) {
      // Never throw from here: nothing catches an error thrown by a filter, so
      // it would end the process. The alert is lost, the request is still answered.
      // Console only: a mail that cannot be sent is already written to the log
      // file by EmailServerService.sendMail.
      console.error(
        'Failed to send error notification email:',
        maskEmails(String(error?.message)),
      );
    }

    // Send the response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
