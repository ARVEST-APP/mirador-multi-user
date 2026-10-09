import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinkMediaGroupController } from './link-media-group.controller';
import { LinkMediaGroupService } from './link-media-group.service';
import { LinkMediaGroup } from './entities/link-media-group.entity';
import { MediaService } from '../../BaseEntities/media/media.service';
import { Media } from '../../BaseEntities/media/entities/media.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { MediaGroupRights } from '../../enum/rights';
import { mediaOrigin } from '../../enum/origins';
import { mediaTypes } from '../../enum/mediaTypes';

describe('LinkMediaGroupController: creating a media', () => {
  const CALLER = 7;
  const OTHER_USER = 8;
  const OWN_GROUP = { id: 70, title: 'the caller' };
  const OTHER_GROUP = { id: 80, title: 'someone else' };
  const CREATED_ID = 700;
  const LINK = 'https://example.org/video.mp4';
  const FILE = { filename: 'image.png', originalname: 'image.png' };

  const save = jest.fn(async (media) => ({ ...media, id: CREATED_ID }));
  const mediaService = new MediaService({
    create: (media) => media,
    save,
  } as unknown as Repository<Media>);
  const groupService = {
    findUserPersonalGroup: jest.fn(async () => OWN_GROUP),
  };
  const service = new LinkMediaGroupService(
    {} as Repository<LinkMediaGroup>,
    groupService as unknown as UserGroupService,
    {} as LinkUserGroupService,
    mediaService,
  );
  const controller = new LinkMediaGroupController(service);

  const link = (body: object) =>
    controller.linkMedia(
      { url: LINK, ...body },
      {
        body: { url: LINK },
        user: { sub: CALLER },
        mediaTypes: mediaTypes.VIDEO,
        generatedHash: 'generated-folder',
      },
    );
  const upload = (body: object) =>
    controller.uploadSingleFile(FILE, body, {
      user: { sub: CALLER },
      generatedHash: 'generated-folder',
    });

  let addMediaToGroup: jest.SpyInstance;

  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    addMediaToGroup = jest
      .spyOn(service, 'addMediaToGroup')
      .mockResolvedValue([]);
    jest.spyOn(service, 'getMediaRightsForUser').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves a linked media with the caller as creator and no other field of the body', async () => {
    await link({
      idCreator: CALLER,
      user_group: OWN_GROUP,
      id: 800,
      hash: 'another-folder',
      path: 'another-file.png',
      thumbnailUrl: 'https://example.org/thumbnail.webp',
      origin: mediaOrigin.UPLOAD,
    });

    expect(save).toHaveBeenCalledWith({
      title: LINK,
      description: 'your media description',
      url: LINK,
      hash: 'generated-folder',
      origin: mediaOrigin.LINK,
      mediaTypes: mediaTypes.VIDEO,
      idCreator: CALLER,
      metadata: { creator: OWN_GROUP.title },
    });
  });

  it('saves an uploaded media with the caller as creator and no other field of the body', async () => {
    await upload({
      idCreator: String(CALLER),
      user_group: JSON.stringify(OWN_GROUP),
      id: '800',
      url: LINK,
    });

    expect(save).toHaveBeenCalledWith({
      title: FILE.originalname,
      description: 'your media description',
      path: FILE.filename,
      hash: 'generated-folder',
      origin: mediaOrigin.UPLOAD,
      mediaTypes: mediaTypes.IMAGE,
      idCreator: CALLER,
      metadata: { creator: OWN_GROUP.title },
    });
  });

  it("gives the admin right to the caller's personal group, read from the database", async () => {
    await link({});

    expect(groupService.findUserPersonalGroup).toHaveBeenCalledWith(CALLER);
    expect(addMediaToGroup).toHaveBeenCalledWith({
      userGroupId: OWN_GROUP.id,
      mediasId: [CREATED_ID],
      rights: MediaGroupRights.ADMIN,
    });
  });

  const OWNER_WARNING = `Creation of a media refused: user ${CALLER} names user ${OTHER_USER} as owner`;
  const GROUP_WARNING = `Creation of a media by user ${CALLER} refused: it names group ${OTHER_GROUP.id}, not their personal group`;

  it.each([
    [
      'a link names another creator',
      () => link({ idCreator: OTHER_USER }),
      OWNER_WARNING,
    ],
    [
      'a link names another group',
      () => link({ user_group: OTHER_GROUP }),
      GROUP_WARNING,
    ],
    [
      'an upload names another creator',
      () => upload({ idCreator: String(OTHER_USER) }),
      OWNER_WARNING,
    ],
    [
      'an upload names another group',
      () => upload({ user_group: JSON.stringify(OTHER_GROUP) }),
      GROUP_WARNING,
    ],
  ])(
    'answers 403, saves nothing and logs one warning when %s',
    async (_case, create, warning) => {
      await expect(create()).rejects.toBeInstanceOf(ForbiddenException);

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(warning);

      expect(save).not.toHaveBeenCalled();
      expect(addMediaToGroup).not.toHaveBeenCalled();
    },
  );
});
