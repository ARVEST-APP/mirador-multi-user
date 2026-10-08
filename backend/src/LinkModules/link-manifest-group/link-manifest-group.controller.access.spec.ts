import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'node:path';
import { Repository } from 'typeorm';
import { LinkManifestGroupController } from './link-manifest-group.controller';
import { LinkManifestGroupService } from './link-manifest-group.service';
import { LinkManifestGroup } from './entities/link-manifest-group.entity';
import { ManifestService } from '../../BaseEntities/manifest/manifest.service';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { ManifestGroupRights } from '../../enum/rights';
import { manifestOrigin } from '../../enum/origins';
import { ActionType } from '../../enum/actions';
import { UPLOAD_FOLDER } from '../../utils/constants';

describe('LinkManifestGroupController: who may call', () => {
  const CALLER = 7;
  const OWN_GROUP = 70;
  const OTHER_GROUP = 80;
  const OWN_MANIFEST = 700;
  const EDITED_MANIFEST = 701;
  const READ_ONLY_MANIFEST = 702;
  const LINKED_MANIFEST = 703;
  const MANIFEST_STORED_OUTSIDE = 704;
  const OTHER_MANIFEST = 800;

  const manifests = [
    {
      id: OWN_MANIFEST,
      origin: manifestOrigin.UPLOAD,
      hash: 'ownhash',
      path: 'own.json',
    },
    {
      id: EDITED_MANIFEST,
      origin: manifestOrigin.CREATE,
      hash: 'editedhash',
      path: 'edited.json',
    },
    {
      id: READ_ONLY_MANIFEST,
      origin: manifestOrigin.UPLOAD,
      hash: 'readhash',
      path: 'read.json',
    },
    {
      id: LINKED_MANIFEST,
      origin: manifestOrigin.LINK,
      hash: null,
      path: null,
    },
    {
      id: MANIFEST_STORED_OUTSIDE,
      origin: manifestOrigin.CREATE,
      hash: '../..',
      path: 'outside.json',
    },
    {
      id: OTHER_MANIFEST,
      origin: manifestOrigin.UPLOAD,
      hash: 'otherhash',
      path: 'other.json',
    },
  ];
  const links = [
    {
      user_group: { id: OWN_GROUP },
      manifest: { id: OWN_MANIFEST },
      rights: ManifestGroupRights.ADMIN,
    },
    {
      user_group: { id: OWN_GROUP },
      manifest: { id: EDITED_MANIFEST },
      rights: ManifestGroupRights.EDITOR,
    },
    {
      user_group: { id: OWN_GROUP },
      manifest: { id: READ_ONLY_MANIFEST },
      rights: ManifestGroupRights.READER,
    },
    {
      user_group: { id: OWN_GROUP },
      manifest: { id: LINKED_MANIFEST },
      rights: ManifestGroupRights.ADMIN,
    },
    {
      user_group: { id: OWN_GROUP },
      manifest: { id: MANIFEST_STORED_OUTSIDE },
      rights: ManifestGroupRights.ADMIN,
    },
    {
      user_group: { id: OTHER_GROUP },
      manifest: { id: OTHER_MANIFEST },
      rights: ManifestGroupRights.ADMIN,
    },
  ];

  const repository = {
    find: jest.fn(async ({ where }) =>
      links.filter(
        (link) =>
          link.user_group.id == where.user_group.id &&
          link.manifest.id == where.manifest.id,
      ),
    ),
  };
  const manifestService = {
    findOne: jest.fn(async (manifestId: number) =>
      manifests.find((manifest) => manifest.id == manifestId),
    ),
  };
  const groupService = {
    findUserPersonalGroup: jest.fn(async () => ({ id: OWN_GROUP })),
  };
  const linkUserGroupService = {
    findALlGroupsForUser: jest.fn(async () => []),
  };

  const service = new LinkManifestGroupService(
    repository as unknown as Repository<LinkManifestGroup>,
    manifestService as unknown as ManifestService,
    groupService as unknown as UserGroupService,
    linkUserGroupService as unknown as LinkUserGroupService,
  );
  const controller = new LinkManifestGroupController(service);

  const requestFor = (action?: ActionType) => ({
    user: { sub: CALLER },
    metadata: { action },
  });
  // AuthGuard copies this metadata into request.metadata.action.
  const actionOf = (handler: keyof LinkManifestGroupController) =>
    Reflect.getMetadata('action', controller[handler]);

  let writeFileSync: jest.SpyInstance;
  let addManifestToGroup: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    addManifestToGroup = jest
      .spyOn(service, 'addManifestToGroup')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PATCH /manifest/updateJson', () => {
    const updateJson = (body: object) =>
      controller.UpdateManifest(
        { json: { label: 'new' }, ...body },
        requestFor(actionOf('UpdateManifest')),
      );

    it('asks for the right to update the manifest', () => {
      expect(actionOf('UpdateManifest')).toBe(ActionType.UPDATE);
    });

    it("writes the caller's manifest where its record says, whatever the body says", async () => {
      await updateJson({
        manifestId: OWN_MANIFEST,
        hash: 'otherhash',
        path: 'other.json',
        origin: manifestOrigin.LINK,
      });

      expect(writeFileSync).toHaveBeenCalledTimes(1);
      expect(writeFileSync.mock.calls[0][0]).toBe(
        path.resolve(UPLOAD_FOLDER, 'ownhash', 'own.json'),
      );
    });

    it('accepts the manifest id under the name `id`', async () => {
      await updateJson({ id: EDITED_MANIFEST });

      expect(writeFileSync.mock.calls[0][0]).toBe(
        path.resolve(UPLOAD_FOLDER, 'editedhash', 'edited.json'),
      );
    });

    it.each([
      ['a manifest the caller can only read', READ_ONLY_MANIFEST],
      ['a manifest of another group', OTHER_MANIFEST],
    ])('refuses %s', async (_case, manifestId) => {
      const answer = await updateJson({ manifestId });

      expect(answer).toBeInstanceOf(ForbiddenException);
      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it('refuses a body without manifest id', async () => {
      await expect(updateJson({})).rejects.toBeInstanceOf(BadRequestException);
      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it.each([
      ['a linked manifest', LINKED_MANIFEST],
      [
        'a manifest whose record points outside the upload folder',
        MANIFEST_STORED_OUTSIDE,
      ],
    ])('does not write %s', async (_case, manifestId) => {
      await expect(updateJson({ manifestId })).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('POST /manifest/add', () => {
    const share = (manifestId: number, rights?: ManifestGroupRights) =>
      controller.addManifestToGroup(
        { manifestId, userGroupId: OTHER_GROUP, rights },
        requestFor(),
      );

    it.each([
      ['an admin grant admin', OWN_MANIFEST, ManifestGroupRights.ADMIN],
      ['an editor grant editor', EDITED_MANIFEST, ManifestGroupRights.EDITOR],
      ['an editor grant the default right', EDITED_MANIFEST, undefined],
    ])('lets %s', async (_case, manifestId, rights) => {
      await share(manifestId, rights);

      expect(addManifestToGroup).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['an editor grant admin', EDITED_MANIFEST, ManifestGroupRights.ADMIN],
      ['a reader share', READ_ONLY_MANIFEST, ManifestGroupRights.READER],
      [
        'a user without access share',
        OTHER_MANIFEST,
        ManifestGroupRights.READER,
      ],
      [
        'an unknown right be granted',
        OWN_MANIFEST,
        'owner' as ManifestGroupRights,
      ],
    ])('does not let %s', async (_case, manifestId, rights) => {
      await expect(share(manifestId, rights)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(addManifestToGroup).not.toHaveBeenCalled();
    });

    it('names the manifest the caller may not share', async () => {
      await expect(share(OTHER_MANIFEST)).rejects.toThrow(
        `id: ${OTHER_MANIFEST}`,
      );
    });
  });
});
