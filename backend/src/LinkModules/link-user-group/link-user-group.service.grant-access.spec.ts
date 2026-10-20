import { Repository } from 'typeorm';
import { LinkUserGroupService } from './link-user-group.service';
import { LinkUserGroup } from './entities/link-user-group.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { User_UserGroupRights } from '../../enum/rights';

describe('LinkUserGroupService.GrantAccessToUserGroup', () => {
  it('answers the new link with the member id and name only', async () => {
    const group = { id: 3, title: 'A group' };
    const service = new LinkUserGroupService(
      {
        create: jest.fn((link) => ({ ...link })),
        upsert: jest.fn(),
      } as unknown as Repository<LinkUserGroup>,
      {
        findOne: jest.fn().mockResolvedValue(group),
      } as unknown as UserGroupService,
      {
        findOne: jest.fn().mockResolvedValue({
          id: 7,
          mail: 'someone@example.org',
          name: 'Someone',
          password: 'the-stored-hash',
          resetToken: 'a-pending-token',
        }),
      } as unknown as UsersService,
      {} as EmailServerService,
      {} as LinkMetadataFormatGroupService,
    );

    const answer = await service.GrantAccessToUserGroup({
      userId: 7,
      user_groupId: group.id,
    });

    expect(answer).toEqual({
      rights: User_UserGroupRights.READER,
      user: { id: 7, name: 'Someone' },
      user_group: group,
    });
  });
});
