import {
  ArgumentsHost,
  Controller,
  INestApplication,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { InternalServerErrorFilter } from './InternalServerErrorExceptionFilter';
import { EmailServerService } from '../email/email.service';

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

  const filterWith = (sendInternalServerErrorNotification: jest.Mock) =>
    new InternalServerErrorFilter({
      sendInternalServerErrorNotification,
    } as unknown as EmailServerService);

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

  it('prints the alert that could not be sent, without e-mail address', async () => {
    const send = jest
      .fn()
      .mockRejectedValue(new Error('rejected <admin@example.org>'));
    const filter = filterWith(send);

    await filter.catch(
      new InternalServerErrorException('boom'),
      hostFor({ url: '/some/route', method: 'POST', body: {} }),
    );

    expect(console.error).toHaveBeenCalledWith(
      'Failed to send error notification email:',
      'rejected <[e-mail]>',
    );
  });

  it("gives the alert the route's pattern, the names of the body's fields and the user's id", async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const filter = filterWith(send);

    await filter.catch(
      new InternalServerErrorException('boom'),
      hostFor({
        url: '/things/search/secret-term?also=secret-query',
        route: { path: '/things/search/:term' },
        method: 'POST',
        body: { token: 'secret-token', password: 'secret-password' },
        user: { sub: 7 },
      }),
    );

    const details = send.mock.calls[0][0];
    expect(details.route).toBe('/things/search/:term');
    expect(details.bodyFields).toEqual(['token', 'password']);
    expect(details.userId).toBe(7);
    expect(JSON.stringify(details)).not.toContain('secret');
  });

  it('sends the alert when the request has no route, no body and no user', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const filter = filterWith(send);

    await filter.catch(
      new InternalServerErrorException('boom'),
      hostFor({ url: '/some/route', method: 'GET' }),
    );

    const details = send.mock.calls[0][0];
    expect(details.route).toBe('unknown route');
    expect(details.bodyFields).toEqual([]);
    expect(details.userId).toBeUndefined();
  });
});

// Through a real Nest application: proves what `request.route.path` holds.
describe('InternalServerErrorFilter in a Nest application', () => {
  @Controller('things')
  class ThingsController {
    @Post('search/:term')
    search() {
      throw new InternalServerErrorException('boom');
    }
  }

  const send = jest.fn().mockResolvedValue(undefined);
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ThingsController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(
      new InternalServerErrorFilter({
        sendInternalServerErrorNotification: send,
      } as unknown as EmailServerService),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("answers 500 and alerts with the route's pattern, not what the user typed", async () => {
    await request(app.getHttpServer())
      .post('/things/search/typed-term?also=typed-query')
      .send({ name: 'typed-value' })
      .expect(500);

    expect(send).toHaveBeenCalledTimes(1);
    const details = send.mock.calls[0][0];
    expect(details.route).toBe('/things/search/:term');
    expect(details.method).toBe('POST');
    expect(details.bodyFields).toEqual(['name']);
    expect(details.userId).toBeUndefined();
    expect(JSON.stringify(details)).not.toContain('typed');
  });
});
