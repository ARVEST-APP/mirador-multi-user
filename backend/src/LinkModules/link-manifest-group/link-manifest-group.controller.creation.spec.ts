import { ForbiddenException } from '@nestjs/common';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { LinkManifestGroupController } from './link-manifest-group.controller';
import { LinkManifestGroupService } from './link-manifest-group.service';
import { LinkManifestGroup } from './entities/link-manifest-group.entity';
import { ManifestService } from '../../BaseEntities/manifest/manifest.service';
import { Manifest } from '../../BaseEntities/manifest/entities/manifest.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { ManifestGroupRights } from '../../enum/rights';
import { manifestOrigin } from '../../enum/origins';
import { CreateLinkGroupManifestDto } from './dto/CreateLinkGroupManifestDto';
import { CreateGroupManifestDto } from './dto/create-group-manifest.dto';
import { manifestCreationDto } from './dto/manifestCreationDto';

describe('LinkManifestGroupController: creating a manifest', () => {
  const CALLER = 7;
  const OTHER_USER = 8;
  const LINK = 'https://example.org/manifest.json';
  const FILE = { filename: 'manifest.json', originalname: 'manifest.json' };
  const request = { user: { sub: CALLER }, generatedHash: 'generated-folder' };

  const save = jest.fn(async (manifest) => ({ ...manifest, id: 700 }));
  const groupService = {
    findUserPersonalGroup: jest.fn(async () => ({ id: 70 })),
  };
  const service = new LinkManifestGroupService(
    {} as Repository<LinkManifestGroup>,
    new ManifestService({
      create: (manifest) => manifest,
      save,
    } as unknown as Repository<Manifest>),
    groupService as unknown as UserGroupService,
    {} as LinkUserGroupService,
  );
  const controller = new LinkManifestGroupController(service);

  const link = (body: object) =>
    controller.linkManifest(
      {
        url: LINK,
        path: LINK,
        title: 'a title',
        rights: ManifestGroupRights.ADMIN,
        ...body,
      } as unknown as CreateLinkGroupManifestDto,
      request,
    );
  const upload = (body: object) =>
    controller.uploadManifest(body as CreateGroupManifestDto, request, FILE);
  const create = (body: object) =>
    controller.createManifest(
      {
        title: 'a title',
        hash: 'generated-folder',
        ...body,
      } as manifestCreationDto,
      request,
    );

  let warn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(service, 'create').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdirSync').mockReturnValue(undefined);
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves a linked manifest with the caller as creator and without the folder name of the body', async () => {
    await link({ idCreator: CALLER, hash: 'another-folder' });

    expect(save).toHaveBeenCalledWith({
      origin: manifestOrigin.LINK,
      description: 'your manifest description',
      title: 'a title',
      idCreator: CALLER,
      url: LINK,
      path: LINK,
      hash: null,
      metadata: {},
    });
  });

  it('gives the creator the admin right on a linked manifest, whatever right the body names', async () => {
    await link({ rights: ManifestGroupRights.READER });

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ rights: ManifestGroupRights.ADMIN }),
    );
  });

  it("puts an uploaded manifest in the caller's personal group when the body names no creator", async () => {
    await upload({});

    expect(groupService.findUserPersonalGroup).toHaveBeenCalledWith(CALLER);
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_group: { id: 70 } }),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ idCreator: CALLER }),
    );
  });

  it.each([
    ['a link', () => link({ idCreator: OTHER_USER })],
    ['an upload', () => upload({ idCreator: String(OTHER_USER) })],
    ['a creation', () => create({ idCreator: OTHER_USER })],
  ])(
    'answers 403, saves nothing and logs one warning when %s names another creator',
    async (_case, send) => {
      await expect((async () => send())()).rejects.toBeInstanceOf(
        ForbiddenException,
      );

      expect(save).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        `Creation of a manifest refused: user ${CALLER} names user ${OTHER_USER} as owner`,
      );
    },
  );
});
