import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../BaseEntities/users/users.service';
import { EmailServerService } from '../utils/email/email.service';
import { ImpersonationService } from '../impersonation/impersonation.service';

describe('AuthService.signIn with an impersonation token', () => {
  const termsValidatedAt = new Date('2026-01-01T00:00:00Z');
  const target = {
    id: 7,
    name: 'target',
    mail: 'target@example.org',
    isEmailConfirmed: true,
    termsValidatedAt,
  };

  const usersService = { findOneByMail: jest.fn() };
  const jwtService = { signAsync: jest.fn() };
  const impersonationService = { consumeToken: jest.fn() };

  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
    {} as EmailServerService,
    impersonationService as unknown as ImpersonationService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    usersService.findOneByMail.mockResolvedValue(target);
    jwtService.signAsync.mockResolvedValue('signed-pass');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the token up and signs a pass for its user', async () => {
    impersonationService.consumeToken.mockResolvedValue({ user: target });

    const result = await service.signIn('', '', 'tok');

    expect(result).toEqual({ access_token: 'signed-pass' });
    expect(impersonationService.consumeToken).toHaveBeenCalledWith('tok');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 7,
      user: 'target',
      isEmailConfirmed: true,
      termsValidatedAt,
    });
  });

  it('answers 401, not 500, when the token is refused', async () => {
    impersonationService.consumeToken.mockRejectedValue(
      new UnauthorizedException('Invalid or expired token'),
    );

    await expect(service.signIn('', '', 'tok')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
