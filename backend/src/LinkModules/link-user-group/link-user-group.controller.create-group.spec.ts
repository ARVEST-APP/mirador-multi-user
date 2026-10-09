import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinkUserGroupController } from './link-user-group.controller';
import { LinkUserGroupService } from './link-user-group.service';
import { LinkUserGroup } from './entities/link-user-group.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { UserGroup } from '../../BaseEntities/user-group/entities/user-group.entity';
import { CreateUserGroupDto } from '../../BaseEntities/user-group/dto/create-user-group.dto';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { User_UserGroupRights } from '../../enum/rights';
import { UserGroupTypes } from '../../enum/user-group-types';

describe('LinkUserGroupController: creating a group', () => {
  const CALLER = 7;
  const OTHER_USER = 8;
  const CREATED_ID = 70;

  const save = jest.fn(async (group) => ({ ...group, id: CREATED_ID }));
  const service = new LinkUserGroupService(
    {} as Repository<LinkUserGroup>,
    new UserGroupService({ save } as unknown as Repository<UserGroup>),
    {} as UsersService,
    {} as EmailServerService,
    {} as LinkMetadataFormatGroupService,
  );
  const controller = new LinkUserGroupController(service);
  const createGroup = (body: object) =>
    controller.createGroup(
      { title: 'a title', ...body } as CreateUserGroupDto,
      { user: { sub: CALLER } },
    );

  let createLink: jest.SpyInstance;

  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    createLink = jest.spyOn(service, 'create').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves a multi-user group with its title, the caller as owner and no other field of the body', async () => {
    await createGroup({
      id: 80,
      ownerId: CALLER,
      user: { id: CALLER, name: 'the caller' },
      type: UserGroupTypes.PERSONAL,
      thumbnailUrl: 'https://example.org/thumbnail.webp',
    });

    expect(save).toHaveBeenCalledWith({
      title: 'a title',
      ownerId: CALLER,
      type: UserGroupTypes.MULTI_USER,
      description: 'group description here',
    });
  });

  it('makes the caller admin of the created group when the body names no user', async () => {
    await createGroup({});

    expect(createLink).toHaveBeenCalledWith({
      rights: User_UserGroupRights.ADMIN,
      userId: CALLER,
      user_groupId: CREATED_ID,
    });
  });

  it.each([
    ['another owner', { ownerId: OTHER_USER }],
    ['another user', { ownerId: CALLER, user: { id: OTHER_USER } }],
  ])(
    'answers 403, saves nothing and logs one warning when the body names %s',
    async (_case, body) => {
      await expect((async () => createGroup(body))()).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(save).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        `Creation of a group refused: user ${CALLER} names user ${OTHER_USER} as owner`,
      );
      expect(createLink).not.toHaveBeenCalled();
    },
  );
});
