import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService.findAllUsers', () => {
  it('reads the fields of the admin user list only', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const service = new UsersService({ find } as unknown as Repository<User>);

    await service.findAllUsers();

    expect(find).toHaveBeenCalledWith({
      select: {
        id: true,
        mail: true,
        name: true,
        createdAt: true,
        _isAdmin: true,
        isEmailConfirmed: true,
        preferredLanguage: true,
        lastConnectedAt: true,
        termsValidatedAt: true,
      },
    });
  });
});
