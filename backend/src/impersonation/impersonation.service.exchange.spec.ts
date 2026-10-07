import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ImpersonationService } from './impersonation.service';
import { Impersonation } from './entities/impersonation.entity';
import { UsersService } from '../BaseEntities/users/users.service';

describe('ImpersonationService: exchanging a token', () => {
  const ADMIN = 1;
  const OTHER_ADMIN = 2;
  const TARGET = 7;
  const termsValidatedAt = new Date('2026-01-01T00:00:00Z');

  const pending = () => ({
    id: 'impersonation-id',
    token: 'tok',
    used: false,
    exchangeBefore: new Date(Date.now() + 60_000),
    adminUser: { id: ADMIN },
    user: {
      id: TARGET,
      name: 'target',
      isEmailConfirmed: true,
      termsValidatedAt,
    },
  });

  const repository = { findOne: jest.fn(), update: jest.fn() };
  const jwtService = { signAsync: jest.fn() };
  let warn: jest.SpyInstance;

  const service = new ImpersonationService(
    repository as unknown as Repository<Impersonation>,
    {} as UsersService,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    repository.findOne.mockResolvedValue(pending());
    repository.update.mockResolvedValue({ affected: 1 });
    jwtService.signAsync.mockResolvedValue('signed-pass');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('consumeToken', () => {
    it('returns the impersonation and marks it used', async () => {
      const impersonation = await service.consumeToken('tok');

      expect(impersonation.user.id).toBe(TARGET);
      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token: 'tok', used: false } }),
      );
      expect(repository.update).toHaveBeenCalledWith(
        { id: 'impersonation-id', used: false },
        { used: true },
      );
    });

    // TypeORM ignores an undefined value in `where`: the lookup would match
    // any impersonation not yet used.
    it.each([[undefined], [null], [''], [{ not: 'a string' }]])(
      'answers 401 without asking the database when the token is %p',
      async (token) => {
        await expect(
          service.consumeToken(token as unknown as string),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(repository.findOne).not.toHaveBeenCalled();
      },
    );

    it('answers 401 for an unknown token', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.consumeToken('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('answers 401 for an expired token', async () => {
      repository.findOne.mockResolvedValue({
        ...pending(),
        exchangeBefore: new Date(Date.now() - 1_000),
      });

      await expect(service.consumeToken('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('answers 401 when the user of the token no longer exists', async () => {
      repository.findOne.mockResolvedValue({ ...pending(), user: null });

      await expect(service.consumeToken('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('answers 401 when another exchange used the token first', async () => {
      repository.update.mockResolvedValue({ affected: 0 });

      await expect(service.consumeToken('tok')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('impersonateUserData', () => {
    it('signs a pass for the user of the token, as a login does', async () => {
      const result = await service.impersonateUserData(
        { token: 'tok', userId: TARGET },
        ADMIN,
      );

      expect(result).toEqual({ access_token: 'signed-pass' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: TARGET,
        user: 'target',
        isEmailConfirmed: true,
        termsValidatedAt,
      });
      expect(repository.update).toHaveBeenCalledWith(
        { id: 'impersonation-id', used: false },
        { used: true },
      );
    });

    it('answers 403 and keeps the token when the body names another user', async () => {
      await expect(
        service.impersonateUserData({ token: 'tok', userId: ADMIN }, ADMIN),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('answers 403 and keeps the token when the caller did not create it', async () => {
      await expect(
        service.impersonateUserData(
          { token: 'tok', userId: TARGET },
          OTHER_ADMIN,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('answers 403, not 500, when the admin who created the token no longer exists', async () => {
      repository.findOne.mockResolvedValue({ ...pending(), adminUser: null });

      await expect(
        service.impersonateUserData({ token: 'tok', userId: TARGET }, ADMIN),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('answers 401, not 500, for an unknown token', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.impersonateUserData({ token: 'tok', userId: TARGET }, ADMIN),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('logs each refusal once, as a warning, without the token', async () => {
      await expect(
        service.impersonateUserData(
          { token: 'tok', userId: TARGET },
          OTHER_ADMIN,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(warn.mock.calls).toEqual([
        [
          `Impersonation refused: user ID ${OTHER_ADMIN} did not create impersonation impersonation-id`,
        ],
      ]);
    });

    it('still answers 500 when the database fails', async () => {
      repository.findOne.mockRejectedValue(new Error('database down'));

      await expect(
        service.impersonateUserData({ token: 'tok', userId: TARGET }, ADMIN),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
