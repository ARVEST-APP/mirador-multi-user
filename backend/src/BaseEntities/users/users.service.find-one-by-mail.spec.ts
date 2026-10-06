import { InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService.findOneByMail', () => {
  const MAIL = 'someone@example.org';
  const findOneBy = jest.fn();
  const service = new UsersService({
    findOneBy,
  } as unknown as Repository<User>);

  beforeEach(() => {
    jest.clearAllMocks();
    // The service logs a failed lookup through the console.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the user with that address', async () => {
    const user = { id: 7, mail: MAIL };
    findOneBy.mockResolvedValue(user);

    await expect(service.findOneByMail(MAIL)).resolves.toBe(user);
    expect(findOneBy).toHaveBeenCalledWith({ mail: MAIL });
  });

  it('returns null when no user has that address', async () => {
    findOneBy.mockResolvedValue(null);

    await expect(service.findOneByMail(MAIL)).resolves.toBeNull();
  });

  // A database failure used to be reported as "not found", with the address.
  it('answers 500, without the address, when the lookup itself fails', async () => {
    findOneBy.mockRejectedValue(new Error('database down'));

    const failure = await service.findOneByMail(MAIL).catch((error) => error);

    expect(failure).toBeInstanceOf(InternalServerErrorException);
    expect(failure.message).not.toContain(MAIL);
  });
});
