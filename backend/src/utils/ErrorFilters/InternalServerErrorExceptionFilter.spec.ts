import { ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { InternalServerErrorFilter } from './InternalServerErrorExceptionFilter';
import { EmailServerService } from '../email/email.service';
import { UsersService } from '../../BaseEntities/users/users.service';

describe('InternalServerErrorFilter', () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  const hostFor = (request: object) =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    }) as unknown as ArgumentsHost;

  const filterWith = (
    sendInternalServerErrorNotification: jest.Mock,
    findOne: jest.Mock = jest.fn(),
  ) =>
    new InternalServerErrorFilter(
      { sendInternalServerErrorNotification } as unknown as EmailServerService,
      { findOne } as unknown as UsersService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the alert and answers 500', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const filter = filterWith(send);

    await filter.catch(
      new InternalServerErrorException('boom'),
      hostFor({ url: '/some/route', method: 'POST', body: {} }),
    );

    expect(send).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, path: '/some/route' }),
    );
  });

  // The backend stopped on 2026-10-04 because this case threw from the filter.
  it('still answers 500, without throwing, when the alert cannot be sent', async () => {
    const send = jest.fn().mockRejectedValue(new Error('SMTP refused'));
    const filter = filterWith(send);

    await expect(
      filter.catch(
        new InternalServerErrorException('boom'),
        hostFor({ url: '/some/route', method: 'POST', body: {} }),
      ),
    ).resolves.toBeUndefined();

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledTimes(1);
  });

  it('still answers 500, without throwing, when the user cannot be read', async () => {
    const send = jest.fn();
    const findOne = jest.fn().mockRejectedValue(new Error('database down'));
    const filter = filterWith(send, findOne);

    await expect(
      filter.catch(
        new InternalServerErrorException('boom'),
        hostFor({
          url: '/some/route',
          method: 'GET',
          body: {},
          user: { sub: 1 },
        }),
      ),
    ).resolves.toBeUndefined();

    expect(send).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(500);
  });
});
