import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LinkGroupProjectService } from './link-group-project.service';
import { LinkUserGroupService } from '../link-user-group/link-user-group.service';
import { AuthGuard } from '../../auth/auth.guard';
import { AddProjectToGroupDto } from './dto/addProjectToGroupDto';
import { CreateProjectDto } from '../../BaseEntities/project/dto/create-project.dto';
import { UpdateProjectGroupDto } from './dto/updateProjectGroupDto';
import { UpdateAccessToProjectDto } from './dto/updateAccessToProjectDto';
import { ActionType } from '../../enum/actions';
import { GroupProjectRights, canGrantItemRights } from '../../enum/rights';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LinkGroupProject } from './entities/link-group-project.entity';
import { LockProjectDto } from './dto/lockProjectDto';
import { Project } from '../../BaseEntities/project/entities/project.entity';

@ApiBearerAuth()
@Controller('link-group-project')
export class LinkGroupProjectController {
  constructor(
    private readonly linkGroupProjectService: LinkGroupProjectService,
    private readonly linkUserGroupService: LinkUserGroupService,
  ) { }

  @ApiOperation({
    summary:
      'Find all links between a group and its projects, for a group the user belongs to',
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get('/:groupId')
  async getAllGroupProjects(@Param('groupId') groupId: number, @Req() request) {
    return await this.linkUserGroupService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      groupId,
      async () => {
        return this.linkGroupProjectService.findAllGroupProjectByUserGroupId(
          groupId,
        );
      },
    );
  }

  @ApiOperation({
    summary:
      'List the groups that can access a project, and their rights on it',
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get('/project/relation/:projectId')
  async getProjectRelation(
    @Param('projectId') projectId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        return this.linkGroupProjectService.getProjectRelations(projectId);
      },
    );
  }

  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Post('/project/lock')
  async handleLockProject(
    @Body() lockProjectDto: LockProjectDto,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      lockProjectDto.projectId,
      async () => {
        return this.linkGroupProjectService.lockProject(
          lockProjectDto.projectId,
          lockProjectDto.lock,
          request.user.sub,
        );
      },
    );
  }

  @ApiOperation({ summary: 'Update project relation and rights on it' })
  @ApiBody({ type: UpdateProjectGroupDto })
  @ApiOkResponse({
    description: 'The project user have access and his rights on it',
    type: LinkGroupProject,
    isArray: true,
  })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Patch('/updateProject/')
  async update(
    @Body() updateProjectGroupDto: UpdateProjectGroupDto,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      updateProjectGroupDto.project.id,
      async () => {
        return this.linkGroupProjectService.updateProject(
          updateProjectGroupDto,
        );
      },
    );
  }

  @ApiOperation({
    summary: 'Allow a group to access a project',
    description:
      'The caller must be editor or admin of the project and cannot grant more than their own right: a higher one answers 403. Default right: reader.',
  })
  @ApiBody({ type: AddProjectToGroupDto })
  @ApiOkResponse({
    description:
      'The group that can access given project and there rights on it',
    type: LinkGroupProject,
    isArray: true,
  })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Post('/project/add')
  async addProjectToGroup(
    @Body() addProjectToGroupDto: AddProjectToGroupDto,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      addProjectToGroupDto.projectId,
      async (linkEntity) => {
        const rightsToGrant =
          addProjectToGroupDto.rights ?? GroupProjectRights.READER;
        if (!canGrantItemRights(linkEntity.rights, rightsToGrant)) {
          throw new ForbiddenException(
            `You are not allowed to share with these rights the project with id: ${addProjectToGroupDto.projectId}`,
          );
        }
        return this.linkGroupProjectService.addProjectToGroup(
          addProjectToGroupDto,
        );
      },
    );
  }

  @ApiOperation({ summary: 'Change access to a project for a specific group' })
  @ApiBody({ type: UpdateAccessToProjectDto })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Patch('/change-rights')
  @HttpCode(204)
  async updateAccessToProject(
    @Body() updateAccessToProjectDto: UpdateAccessToProjectDto,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      updateAccessToProjectDto.projectId,
      async () => {
        return this.linkGroupProjectService.updateAccessToProject(
          updateAccessToProjectDto,
          request.user.sub,
        );
      },
    );
  }

  @ApiOperation({ summary: 'delete a project' })
  @SetMetadata('action', ActionType.DELETE)
  @UseGuards(AuthGuard)
  @Delete('/delete/project/:projectId')
  async deleteProject(@Param('projectId') project_id: number, @Req() request) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      project_id,
      async (linkEntity) => {
        return this.linkGroupProjectService.deleteProject(
          linkEntity.project.id,
        );
      },
    );
  }

  @ApiOperation({ summary: 'Remove access to a project to a specific group' })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Delete('/project/:projectId/:groupId')
  async deleteGroupProjectLink(
    @Param('projectId') projectId: number,
    @Param('groupId') groupId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        return this.linkGroupProjectService.RemoveProjectToGroup({
          projectId,
          groupId,
        });
      },
    );
  }

  @ApiOperation({ summary: "Remove a project from user's list" })
  @UseGuards(AuthGuard)
  @Delete('/remove-project/:projectId')
  async removeProjectFromUser(
    @Param('projectId') projectId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.removeProjectFromUser(
      projectId,
      request.user.sub,
    );
  }

  //TODO: Check if this routes is usefull
  // @UseGuards(AuthGuard)
  // @Get('/project/:projectId/:userGroupId')
  // getProjectForUser(
  //   @Param('projectId') projectId: number,
  //   @Param('userGroupId') userGroupId: number,
  // ) {
  //   return this.linkGroupProjectService.getProjectRightForUser(
  //     projectId,
  //     userGroupId,
  //   );
  // }

  @ApiOperation({
    summary: 'Search for a project that a group the user belongs to can access',
  })
  @ApiOkResponse({
    description: 'The project and rights for the user on it',
    type: LinkGroupProject,
    isArray: true,
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get('/search/:UserGroupId/:partialProjectName')
  async lookingForProject(
    @Param('partialProjectName') partialProjectName: string,
    @Param('UserGroupId') userGroupId: number,
    @Req() request,
  ) {
    return await this.linkUserGroupService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      userGroupId,
      async () => {
        return this.linkGroupProjectService.searchForUserGroupProjectWithPartialProjectName(
          partialProjectName,
          userGroupId,
        );
      },
    );
  }

  @ApiOperation({ summary: 'Project creation, for the logged-in user' })
  @ApiBody({ type: CreateProjectDto })
  @UseGuards(AuthGuard)
  @Post('/project/')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() request,
  ) {
    const ownerId = createProjectDto.ownerId;
    if (ownerId != undefined && Number(ownerId) !== Number(request.user.sub)) {
      throw new ForbiddenException(
        'A project can only be created for the logged-in user',
      );
    }
    return this.linkGroupProjectService.createProject({
      ...createProjectDto,
      ownerId: request.user.sub,
    });
  }

  @ApiOperation({ summary: 'Get all projects a user have access to.' })
  @ApiOkResponse({
    description: 'A list of projects the user have access and his rights on each of them.',
    type: LinkGroupProject,
    isArray: true,
  })
  @UseGuards(AuthGuard)
  @Get('/user/projects/:userId')
  async getAllUsersProjects(@Param('userId') userId: number, @Req() request) {
    if (request.user.sub == userId) {
      return await this.linkGroupProjectService.findAllUserProjects(userId);
    } else {
      return new UnauthorizedException(
        'you are not allowed to request for this projects',
      );
    }
  }

  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiOkResponse({
    description: 'The project with ID projectId, if the user has to it.',
    type: Project,
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get('projects/:projectId')
  async getProjectById(
    @Param('projectId') projectId: number,
    @Req() request
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        const linkedProject = await this.linkGroupProjectService.getProject(
          projectId
        );
        return linkedProject.project;
      },
    );
  }

  @ApiOperation({ summary: 'Duplicate a project' })
  @ApiOkResponse({
    description: 'Duplicate a project',
    type: LinkGroupProject,
    isArray: true,
  })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Post('/project/duplicate/:projectId')
  async duplicateProject(
    @Param('projectId') projectId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        return this.linkGroupProjectService.duplicateProject(
          projectId,
          request.user.sub,
        );
      },
    );
  }

  @ApiOperation({ summary: 'Create project snapshot' })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Get('/snapshot/:projectId')
  async generateSnapshot(
    @Param('projectId') projectId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        return this.linkGroupProjectService.generateProjectSnapshot(projectId);
      },
    );
  }

  @ApiOperation({ summary: 'Check if project is lock and user can access it' })
  @UseGuards(AuthGuard)
  @Get('/project/isLocked/:projectId')
  async isLocked(@Param('projectId') projectId: number, @Req() request) {
    return await this.linkGroupProjectService.isProjectLocked(
      projectId,
      request.user.sub,
    );
  }
}
