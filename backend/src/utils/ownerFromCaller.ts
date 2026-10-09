import { ForbiddenException } from '@nestjs/common';
import { CustomLogger } from './Logger/CustomLogger.service';

const logger = new CustomLogger();

/**
 * The owner of an object being created: always the caller. Refuses a body that
 * names someone else (a number sent as text is the same value), with one
 * warning in the log. `kind` names the object in that warning.
 */
export function ownerFromCaller(
  sentId: unknown,
  callerId: number,
  kind: string,
): number {
  if (sentId !== undefined && Number(sentId) !== Number(callerId)) {
    logger.warn(
      `Creation of a ${kind} refused: user ${callerId} names user ${Number(sentId)} as owner`,
    );
    throw new ForbiddenException(
      'A new object belongs to the logged in user: send your own id, or none',
    );
  }
  return callerId;
}
