import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../BaseEntities/users/users.service';
import { EmailServerService } from '../utils/email/email.service';
import { ImpersonationService } from '../impersonation/impersonation.service';

describe('AuthService.resetPassword', () => {
  const PASSWORD = 'a-long-enough-password';
  const payload = { mail: 'someone@example.org', name: 'someone' };

  const usersService = {
    findOneByMail: jest.fn(),
    updateUser: jest.fn(),
  };
  const jwtService = { verify: jest.fn() };
  let warn: jest.SpyInstance;

  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
    {} as EmailServerService,
    {} as ImpersonationService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // The service logs every refused token through the console.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jwtService.verify.mockReturnValue(payload);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates the password when the token is the one stored for the user', async () => {
    usersService.findOneByMail.mockResolvedValue({ id: 7, resetToken: 'tok' });

    await service.resetPassword('tok', PASSWORD);

    expect(usersService.updateUser).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ resetToken: null }),
    );
  });

  // The backend stopped on 2026-10-04 after this case was raised as a 500.
  it('answers 401, not 500, when the token is not the one stored for the user', async () => {
    usersService.findOneByMail.mockResolvedValue({
      id: 7,
      resetToken: 'another-token',
    });

    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(usersService.updateUser).not.toHaveBeenCalled();
  });

  it('answers 404, not 500, when the token names no user', async () => {
    usersService.findOneByMail.mockResolvedValue(null);

    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('logs each refusal once, as a warning, without the e-mail address', async () => {
    usersService.findOneByMail.mockResolvedValue(null);
    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(warn.mock.calls).toEqual([
      ['Password reset refused: no user found for the address in the token'],
    ]);

    warn.mockClear();
    usersService.findOneByMail.mockResolvedValue({
      id: 7,
      resetToken: 'another-token',
    });
    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(warn.mock.calls).toEqual([
      ['Password reset refused: token is not the one stored for user ID 7'],
    ]);
  });

  it('answers 400 when the token cannot be verified', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    // already logged where the token is decoded: not a second time here
    expect(warn).not.toHaveBeenCalled();
  });

  it('still answers 500 when the user lookup itself fails', async () => {
    // what UsersService.findOneByMail raises when the database fails
    usersService.findOneByMail.mockRejectedValue(
      new InternalServerErrorException(
        'An error occurred while looking for the user',
      ),
    );

    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('still answers 500 for an unexpected error', async () => {
    usersService.findOneByMail.mockResolvedValue({ id: 7, resetToken: 'tok' });
    usersService.updateUser.mockRejectedValue(new Error('database down'));

    await expect(service.resetPassword('tok', PASSWORD)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
