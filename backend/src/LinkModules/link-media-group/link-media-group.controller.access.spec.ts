import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinkMediaGroupController } from './link-media-group.controller';
import { LinkMediaGroupService } from './link-media-group.service';
import { LinkMediaGroup } from './entities/link-media-group.entity';
import { MediaService } from '../../BaseEntities/media/media.service';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { MediaGroupRights } from '../../enum/rights';

describe('LinkMediaGroupController: who may call', () => {
  const CALLER = 7;
  const OWN_GROUP = 70;
  const OTHER_GROUP = 80;
  const OWN_MEDIA = 700;
  const EDITED_MEDIA = 701;
  const READ_ONLY_MEDIA = 702;
  const OTHER_MEDIA = 800;

  const links = [
    {
      user_group: { id: OWN_GROUP },
      media: { id: OWN_MEDIA },
      rights: MediaGroupRights.ADMIN,
    },
    {
      user_group: { id: OWN_GROUP },
      media: { id: EDITED_MEDIA },
      rights: MediaGroupRights.EDITOR,
    },
    {
      user_group: { id: OWN_GROUP },
      media: { id: READ_ONLY_MEDIA },
      rights: MediaGroupRights.READER,
    },
    {
      user_group: { id: OTHER_GROUP },
      media: { id: OTHER_MEDIA },
      rights: MediaGroupRights.ADMIN,
    },
  ];

  const repository = {
    find: jest.fn(async ({ where }) =>
      links.filter(
        (link) =>
          link.user_group.id == where.user_group.id &&
          link.media.id == where.media.id,
      ),
    ),
  };
  const groupService = {
    findUserPersonalGroup: jest.fn(async () => ({ id: OWN_GROUP })),
  };
  const linkUserGroupService = {
    findALlGroupsForUser: jest.fn(async () => []),
  };

  const service = new LinkMediaGroupService(
    repository as unknown as Repository<LinkMediaGroup>,
    groupService as unknown as UserGroupService,
    linkUserGroupService as unknown as LinkUserGroupService,
    {} as MediaService,
  );
  const controller = new LinkMediaGroupController(service);

  let addMediaToGroup: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    addMediaToGroup = jest
      .spyOn(service, 'addMediaToGroup')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /media/add', () => {
    const share = (mediasId: number[], rights?: MediaGroupRights) =>
      controller.addMediaToGroup(
        { mediasId, userGroupId: OTHER_GROUP, rights },
        { user: { sub: CALLER } },
      );

    it.each([
      ['an admin grant admin', [OWN_MEDIA], MediaGroupRights.ADMIN],
      ['an editor grant editor', [EDITED_MEDIA], MediaGroupRights.EDITOR],
      ['an editor grant the default right', [EDITED_MEDIA], undefined],
    ])('lets %s', async (_case, mediasId, rights) => {
      await share(mediasId, rights);

      expect(addMediaToGroup).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['an editor grant admin', [EDITED_MEDIA], MediaGroupRights.ADMIN],
      ['a reader share', [READ_ONLY_MEDIA], MediaGroupRights.READER],
      ['a user without access share', [OTHER_MEDIA], MediaGroupRights.READER],
      [
        'a list be shared when one media is not allowed',
        [OWN_MEDIA, OTHER_MEDIA],
        MediaGroupRights.READER,
      ],
      ['an unknown right be granted', [OWN_MEDIA], 'owner' as MediaGroupRights],
    ])('does not let %s', async (_case, mediasId, rights) => {
      await expect(share(mediasId, rights)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(addMediaToGroup).not.toHaveBeenCalled();
    });

    it('names every media the caller may not share', async () => {
      await expect(
        share([OTHER_MEDIA, OWN_MEDIA, READ_ONLY_MEDIA]),
      ).rejects.toThrow(`id: ${OTHER_MEDIA}, ${READ_ONLY_MEDIA}`);
    });
  });
});
