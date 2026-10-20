import { Repository } from 'typeorm';
import { LinkUserGroupService } from './link-user-group.service';
import { LinkUserGroup } from './entities/link-user-group.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { User_UserGroupRights } from '../../enum/rights';

describe('LinkUserGroupService.ChangeAccessToUserGroup', () => {
  const CALLER = 1;
  const MEMBER = 7;
  const GROUP = 3;

  it('answers the changed link with the member id and name only', async () => {
    const group = { id: GROUP, ownerId: CALLER };
    const repository = {
      findOne: jest.fn().mockResolvedValue({
        id: 5,
        rights: User_UserGroupRights.READER,
        user: {
          id: MEMBER,
          mail: 'someone@example.org',
          name: 'Someone',
          password: 'the-stored-hash',
          resetToken: 'a-pending-token',
        },
        user_group: group,
      }),
      upsert: jest.fn(),
    };
    const service = new LinkUserGroupService(
      repository as unknown as Repository<LinkUserGroup>,
      {} as UserGroupService,
      {} as UsersService,
      {} as EmailServerService,
      {} as LinkMetadataFormatGroupService,
    );
    jest
      .spyOn(service, 'getHighestRightForGroup')
      .mockImplementation(async (_groupId, userId) =>
        userId === CALLER
          ? ({ rights: User_UserGroupRights.ADMIN } as LinkUserGroup)
          : ({ rights: User_UserGroupRights.READER } as LinkUserGroup),
      );

    const answer = await service.ChangeAccessToUserGroup(
      GROUP,
      MEMBER,
      User_UserGroupRights.EDITOR,
      CALLER,
    );

    expect(answer).toEqual({
      id: 5,
      rights: User_UserGroupRights.EDITOR,
      user: { id: MEMBER, name: 'Someone' },
      user_group: group,
    });
  });
});
