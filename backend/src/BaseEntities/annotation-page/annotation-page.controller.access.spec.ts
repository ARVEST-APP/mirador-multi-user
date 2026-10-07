import { ForbiddenException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Repository } from 'typeorm';
import { AnnotationPageController } from './annotation-page.controller';
import { AnnotationPageService } from './annotation-page.service';
import { CreateAnnotationPageDto } from './dto/create-annotation-page.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { LinkGroupProjectService } from '../../LinkModules/link-group-project/link-group-project.service';
import { LinkGroupProject } from '../../LinkModules/link-group-project/entities/link-group-project.entity';
import { ProjectService } from '../project/project.service';
import { UserGroupService } from '../user-group/user-group.service';
import { LinkUserGroupService } from '../../LinkModules/link-user-group/link-user-group.service';
import { MetadataService } from '../metadata/metadata.service';
import { GroupProjectRights } from '../../enum/rights';
import { ActionType } from '../../enum/actions';

describe('AnnotationPageController: who may call', () => {
  const CALLER = 7;
  const OWN_GROUP = 70;
  const EDITABLE_PROJECT = 700;
  const READ_ONLY_PROJECT = 701;
  const OTHER_PROJECT = 800;
  const PAGE_ID = 'https://example.org/canvas/1/annotationPage';

  const links = [
    {
      user_group: { id: OWN_GROUP },
      project: { id: EDITABLE_PROJECT },
      rights: GroupProjectRights.EDITOR,
    },
    {
      user_group: { id: OWN_GROUP },
      project: { id: READ_ONLY_PROJECT },
      rights: GroupProjectRights.READER,
    },
  ];

  const linkRepository = {
    find: jest.fn(async ({ where }) =>
      links.filter(
        (link) =>
          link.user_group.id == where.user_group.id &&
          link.project.id == where.project.id,
      ),
    ),
  };
  const annotationPageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    deleteAnnotationPage: jest.fn(),
  };

  const linkGroupProjectService = new LinkGroupProjectService(
    linkRepository as unknown as Repository<LinkGroupProject>,
    {} as ProjectService,
    {
      findUserPersonalGroup: jest.fn(async () => ({ id: OWN_GROUP })),
    } as unknown as UserGroupService,
    {
      findALlGroupsForUser: jest.fn(async () => []),
    } as unknown as LinkUserGroupService,
    {} as MetadataService,
    annotationPageService as unknown as AnnotationPageService,
  );
  const controller = new AnnotationPageController(
    annotationPageService as unknown as AnnotationPageService,
    linkGroupProjectService,
  );

  const requestFor = (action: ActionType) => ({
    user: { sub: CALLER },
    metadata: { action },
  });
  const dto = (projectId: number) =>
    ({ projectId, annotationPageId: PAGE_ID }) as CreateAnnotationPageDto;

  beforeEach(() => {
    jest.clearAllMocks();
    annotationPageService.create.mockResolvedValue(['saved']);
    annotationPageService.findAll.mockResolvedValue(['found']);
    annotationPageService.findOne.mockResolvedValue('found');
    annotationPageService.deleteAnnotationPage.mockResolvedValue('deleted');
  });

  // AuthGuard copies the 'action' metadata into request.metadata.action.
  it.each([
    ['create', ActionType.UPDATE],
    ['findAll', ActionType.READ],
    ['findOne', ActionType.READ],
    ['delete', ActionType.UPDATE],
  ] as const)(
    '%s needs a login and the right to %s the project',
    (handler, action) => {
      expect(Reflect.getMetadata(GUARDS_METADATA, controller[handler])).toEqual(
        [AuthGuard],
      );
      expect(Reflect.getMetadata('action', controller[handler])).toBe(action);
    },
  );

  describe('POST /', () => {
    it('saves the page of a project the caller can update', async () => {
      const result = await controller.create(
        dto(EDITABLE_PROJECT),
        requestFor(ActionType.UPDATE),
      );

      expect(result).toEqual(['saved']);
    });

    it.each([
      ['the caller has no access to', OTHER_PROJECT],
      ['the caller can only read', READ_ONLY_PROJECT],
    ])('saves nothing for a project %s', async (_case, projectId) => {
      const result = await controller.create(
        dto(projectId),
        requestFor(ActionType.UPDATE),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
      expect(annotationPageService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /:annotationPageId/:projectId', () => {
    it('returns the pages of a project the caller can read', async () => {
      const result = await controller.findAll(
        READ_ONLY_PROJECT,
        PAGE_ID,
        requestFor(ActionType.READ),
      );

      expect(result).toEqual(['found']);
      expect(annotationPageService.findAll).toHaveBeenCalledWith(
        PAGE_ID,
        READ_ONLY_PROJECT,
      );
    });

    it('returns nothing for a project the caller has no access to', async () => {
      const all = await controller.findAll(
        OTHER_PROJECT,
        PAGE_ID,
        requestFor(ActionType.READ),
      );
      const one = await controller.findOne(
        encodeURIComponent(PAGE_ID),
        OTHER_PROJECT,
        requestFor(ActionType.READ),
      );

      expect(all).toBeInstanceOf(ForbiddenException);
      expect(one).toBeInstanceOf(ForbiddenException);
      expect(annotationPageService.findAll).not.toHaveBeenCalled();
      expect(annotationPageService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /:annotationPageId/:projectId', () => {
    it('deletes the page of a project the caller can update', async () => {
      const result = await controller.delete(
        EDITABLE_PROJECT,
        encodeURIComponent(PAGE_ID),
        requestFor(ActionType.UPDATE),
      );

      expect(result).toBe('deleted');
      expect(annotationPageService.deleteAnnotationPage).toHaveBeenCalledWith(
        PAGE_ID,
        EDITABLE_PROJECT,
      );
    });

    it.each([
      ['the caller has no access to', OTHER_PROJECT],
      ['the caller can only read', READ_ONLY_PROJECT],
    ])('deletes nothing for a project %s', async (_case, projectId) => {
      const result = await controller.delete(
        projectId,
        encodeURIComponent(PAGE_ID),
        requestFor(ActionType.UPDATE),
      );

      expect(result).toBeInstanceOf(ForbiddenException);
      expect(annotationPageService.deleteAnnotationPage).not.toHaveBeenCalled();
    });
  });
});
