import { Repository } from 'typeorm';
import { LinkUserGroupService } from './link-user-group.service';
import { LinkUserGroup } from './entities/link-user-group.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { User_UserGroupRights } from '../../enum/rights';

describe('LinkUserGroupService.findAllUsersForGroup', () => {
  it('answers each member with its id and name only', async () => {
    const group = { id: 3, title: 'A group' };
    const member = (
      id: number,
      name: string,
      rights: User_UserGroupRights,
    ) => ({
      id: id * 10,
      rights,
      user: {
        id,
        mail: `${name}@example.org`,
        name,
        password: 'the-stored-hash',
        resetToken: 'a-pending-token',
      },
      user_group: group,
    });
    const find = jest
      .fn()
      .mockResolvedValue([
        member(1, 'Owner', User_UserGroupRights.ADMIN),
        member(7, 'Someone', User_UserGroupRights.READER),
      ]);
    const service = new LinkUserGroupService(
      { find } as unknown as Repository<LinkUserGroup>,
      {
        findUserPersonalGroup: jest.fn(async (userId: number) => ({
          id: userId + 100,
        })),
      } as unknown as UserGroupService,
      {} as UsersService,
      {} as EmailServerService,
      {} as LinkMetadataFormatGroupService,
    );

    const answer = await service.findAllUsersForGroup(group.id);

    expect(answer).toEqual([
      {
        id: 10,
        rights: User_UserGroupRights.ADMIN,
        user: { id: 1, name: 'Owner' },
        user_group: group,
        personalOwnerGroupId: 101,
      },
      {
        id: 70,
        rights: User_UserGroupRights.READER,
        user: { id: 7, name: 'Someone' },
        user_group: group,
        personalOwnerGroupId: 107,
      },
    ]);
  });
});
