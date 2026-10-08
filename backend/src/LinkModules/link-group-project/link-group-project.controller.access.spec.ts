import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinkGroupProjectController } from './link-group-project.controller';
import { LinkGroupProjectService } from './link-group-project.service';
import { LinkGroupProject } from './entities/link-group-project.entity';
import { ProjectService } from '../../BaseEntities/project/project.service';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { LinkUserGroup } from '../link-user-group/entities/link-user-group.entity';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { MetadataService } from '../../BaseEntities/metadata/metadata.service';
import { AnnotationPageService } from '../../BaseEntities/annotation-page/annotation-page.service';
import { CreateProjectDto } from '../../BaseEntities/project/dto/create-project.dto';
import { GroupProjectRights, User_UserGroupRights } from '../../enum/rights';
import { ActionType } from '../../enum/actions';

describe('LinkGroupProjectController: who may call', () => {
  const CALLER = 7;
  const OTHER_USER = 8;
  const OWN_GROUP = 70;
  const OTHER_GROUP = 80;
  const OWN_PROJECT = 700;
  const READ_ONLY_PROJECT = 701;
  const OTHER_PROJECT = 800;

  const links = [
    {
      user_group: { id: OWN_GROUP, ownerId: CALLER },
      project: { id: OWN_PROJECT },
      rights: GroupProjectRights.ADMIN,
    },
    {
      user_group: { id: OWN_GROUP, ownerId: CALLER },
      project: { id: READ_ONLY_PROJECT },
      rights: GroupProjectRights.READER,
    },
    {
      user_group: { id: OTHER_GROUP, ownerId: OTHER_USER },
      project: { id: OTHER_PROJECT },
      rights: GroupProjectRights.ADMIN,
    },
  ];

  const personalGroupOf = (userId: number) =>
    userId == CALLER ? { id: OWN_GROUP } : { id: OTHER_GROUP };

  const repository = {
    find: jest.fn(async ({ where }) =>
      links.filter(
        (link) =>
          (!where.user_group || link.user_group.id == where.user_group.id) &&
          (!where.project || link.project.id == where.project.id),
      ),
    ),
  };
  const projectService = {
    findProjectsByPartialNameAndUserGroup: jest.fn(
      async (_partialName: string, groupId: number) =>
        links
          .filter((link) => link.user_group.id == groupId)
          .map((link) => link.project),
    ),
    findOne: jest.fn(async (projectId: number) => ({ id: projectId })),
  };
  const groupService = {
    findUserPersonalGroup: jest.fn(async (userId: number) =>
      personalGroupOf(userId),
    ),
    findOne: jest.fn(async (groupId: number) => ({ id: groupId })),
  };
  const memberships = [
    {
      user: { id: CALLER },
      user_group: { id: OWN_GROUP, ownerId: CALLER },
      rights: User_UserGroupRights.ADMIN,
    },
    {
      user: { id: OTHER_USER },
      user_group: { id: OTHER_GROUP, ownerId: OTHER_USER },
      rights: User_UserGroupRights.ADMIN,
    },
  ];
  const membershipRepository = {
    find: jest.fn(async ({ where }) =>
      memberships.filter(
        (membership) =>
          membership.user.id == where.user.id &&
          (!where.user_group ||
            membership.user_group.id == where.user_group.id),
      ),
    ),
  };
  const linkUserGroupService = new LinkUserGroupService(
    membershipRepository as unknown as Repository<LinkUserGroup>,
    groupService as unknown as UserGroupService,
    {} as UsersService,
    {} as EmailServerService,
    {} as LinkMetadataFormatGroupService,
  );

  const service = new LinkGroupProjectService(
    repository as unknown as Repository<LinkGroupProject>,
    projectService as unknown as ProjectService,
    groupService as unknown as UserGroupService,
    linkUserGroupService,
    {} as MetadataService,
    {} as AnnotationPageService,
  );
  const controller = new LinkGroupProjectController(
    service,
    linkUserGroupService,
  );

  const requestFor = (action?: ActionType) => ({
    user: { sub: CALLER },
    metadata: { action },
  });
  // AuthGuard copies this metadata into request.metadata.action.
  const actionOf = (handler: keyof LinkGroupProjectController) =>
    Reflect.getMetadata('action', controller[handler]);

  let generateProjectSnapshot: jest.SpyInstance;
  let createProject: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    generateProjectSnapshot = jest
      .spyOn(service, 'generateProjectSnapshot')
      .mockResolvedValue({ snapShotHash: 'hash' });
    createProject = jest
      .spyOn(service, 'createProject')
      .mockResolvedValue(links[0] as unknown as LinkGroupProject);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /:groupId', () => {
    it('asks for the right to read the group', () => {
      expect(actionOf('getAllGroupProjects')).toBe(ActionType.READ);
    });

    it("lists the projects of the caller's own group", async () => {
      const result = await controller.getAllGroupProjects(
        OWN_GROUP,
        requestFor(ActionType.READ),
      );

      expect(result).toEqual([links[0], links[1]]);
    });

    it('refuses a group the caller is not in, as the group routes do', async () => {
      const result = await controller.getAllGroupProjects(
        OTHER_GROUP,
        requestFor(ActionType.READ),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });

  describe('GET /search/:UserGroupId/:partialProjectName', () => {
    it('asks for the right to read the group', () => {
      expect(actionOf('lookingForProject')).toBe(ActionType.READ);
    });

    it("searches the projects of the caller's own group", async () => {
      const result = await controller.lookingForProject(
        'any',
        OWN_GROUP,
        requestFor(ActionType.READ),
      );

      expect(result).toEqual([links[0], links[1]]);
    });

    it('refuses a group the caller is not in, as the group routes do', async () => {
      const result = await controller.lookingForProject(
        'any',
        OTHER_GROUP,
        requestFor(ActionType.READ),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
      expect(
        projectService.findProjectsByPartialNameAndUserGroup,
      ).not.toHaveBeenCalled();
    });
  });

  describe('GET /project/relation/:projectId', () => {
    it('asks for the right to read the project', () => {
      expect(actionOf('getProjectRelation')).toBe(ActionType.READ);
    });

    it('lists the groups of a project the caller can read', async () => {
      const result = await controller.getProjectRelation(
        READ_ONLY_PROJECT,
        requestFor(ActionType.READ),
      );

      expect(result).toEqual([
        { ...links[1], personalOwnerGroupId: OWN_GROUP },
      ]);
    });

    it('refuses a project the caller has no access to, as the other project routes do', async () => {
      const result = await controller.getProjectRelation(
        OTHER_PROJECT,
        requestFor(ActionType.READ),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
    });
  });

  describe('GET /snapshot/:projectId', () => {
    it('asks for the right to update the project', () => {
      expect(actionOf('generateSnapshot')).toBe(ActionType.UPDATE);
    });

    it('creates the snapshot of a project the caller can update', async () => {
      const result = await controller.generateSnapshot(
        OWN_PROJECT,
        requestFor(ActionType.UPDATE),
      );

      expect(result).toEqual({ snapShotHash: 'hash' });
      expect(generateProjectSnapshot).toHaveBeenCalledWith(OWN_PROJECT);
    });

    it.each([
      ['the caller has no access to', OTHER_PROJECT],
      ['the caller can only read', READ_ONLY_PROJECT],
    ])('creates nothing for a project %s', async (_case, projectId) => {
      const result = await controller.generateSnapshot(
        projectId,
        requestFor(ActionType.UPDATE),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
      expect(generateProjectSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('POST /project', () => {
    const dto = (ownerId?: number) =>
      ({ title: 'a project', metadata: {}, ownerId }) as CreateProjectDto;

    it.each([
      ['names the caller as owner', CALLER],
      ['names no owner', undefined],
    ])(
      'creates the project for the caller when the body %s',
      async (_case, ownerId) => {
        await controller.createProject(dto(ownerId), requestFor());

        expect(createProject).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'a project', ownerId: CALLER }),
        );
      },
    );

    it('answers 403 when the body names another user as owner', async () => {
      await expect(
        controller.createProject(dto(OTHER_USER), requestFor()),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(createProject).not.toHaveBeenCalled();
    });
  });

  describe('POST /project/add', () => {
    let addProjectToGroup: jest.SpyInstance;

    beforeEach(() => {
      addProjectToGroup = jest
        .spyOn(service, 'addProjectToGroup')
        .mockResolvedValue([]);
    });

    const share = (projectId: number, rights?: GroupProjectRights) =>
      controller.addProjectToGroup(
        { projectId, groupId: OTHER_GROUP, rights },
        requestFor(ActionType.UPDATE),
      );
    const callerIsEditor = () =>
      jest
        .spyOn(service, 'getHighestRightForProject')
        .mockResolvedValue({ rights: GroupProjectRights.EDITOR });

    it('lets an admin grant admin', async () => {
      await share(OWN_PROJECT, GroupProjectRights.ADMIN);

      expect(addProjectToGroup).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['editor', GroupProjectRights.EDITOR],
      ['the default right', undefined],
    ])('lets an editor grant %s', async (_case, rights) => {
      callerIsEditor();

      await share(OWN_PROJECT, rights);

      expect(addProjectToGroup).toHaveBeenCalledTimes(1);
    });

    it('answers 403, naming the project, when an editor grants admin', async () => {
      callerIsEditor();

      const answer = share(OWN_PROJECT, GroupProjectRights.ADMIN);

      await expect(answer).rejects.toBeInstanceOf(ForbiddenException);
      await expect(answer).rejects.toThrow(`id: ${OWN_PROJECT}`);
      expect(addProjectToGroup).not.toHaveBeenCalled();
    });

    it('answers with the groups of the shared project', async () => {
      addProjectToGroup.mockRestore();
      jest.spyOn(service, 'create').mockResolvedValue(undefined);

      const answer = await share(OWN_PROJECT);

      expect(answer).toEqual([
        { ...links[0], personalOwnerGroupId: OWN_GROUP },
      ]);
    });
  });
});
