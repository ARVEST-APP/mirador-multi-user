import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Language } from '../../utils/email/utils';

describe('UsersService.create', () => {
  const SIGN_UP = {
    mail: 'someone@example.org',
    name: 'Someone',
    password: 'a-hashed-password',
    preferredLanguage: Language.FRENCH,
  };
  const save = jest.fn();
  const service = new UsersService({ save } as unknown as Repository<User>);
  const smtpDomain = process.env.SMTP_DOMAIN;

  beforeEach(() => {
    jest.clearAllMocks();
    save.mockImplementation(async (user) => ({ id: 7, ...user }));
  });

  afterEach(() => {
    process.env.SMTP_DOMAIN = smtpDomain;
  });

  it('saves the mail, name, password and language, and no other field of the body', async () => {
    process.env.SMTP_DOMAIN = 'smtp.example.org';
    const body = {
      ...SIGN_UP,
      id: 3,
      isEmailConfirmed: true,
      termsValidatedAt: '2026-01-01T00:00:00.000Z',
      resetToken: 'a-token',
      createdAt: '2020-01-01T00:00:00.000Z',
    } as unknown as CreateUserDto;

    await service.create(body);

    expect(save).toHaveBeenCalledWith(SIGN_UP);
  });

  it('marks the address as confirmed when no mail server is configured', async () => {
    delete process.env.SMTP_DOMAIN;

    await service.create(SIGN_UP as unknown as CreateUserDto);

    expect(save).toHaveBeenCalledWith({ ...SIGN_UP, isEmailConfirmed: true });
  });
});
