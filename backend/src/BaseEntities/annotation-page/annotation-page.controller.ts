import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AnnotationPageService } from './annotation-page.service';
import { CreateAnnotationPageDto } from './dto/create-annotation-page.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LinkGroupProjectService } from '../../LinkModules/link-group-project/link-group-project.service';
import { ActionType } from '../../enum/actions';

@ApiBearerAuth()
@Controller('annotation-page')
export class AnnotationPageController {
  constructor(
    private readonly annotationPageService: AnnotationPageService,
    private readonly linkGroupProjectService: LinkGroupProjectService,
  ) {}

  @ApiOperation({
    summary:
      'Create or replace an annotation page of a project the user can update',
  })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createAnnotationPageDto: CreateAnnotationPageDto,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      createAnnotationPageDto.projectId,
      async () => {
        return this.annotationPageService.create(createAnnotationPageDto);
      },
    );
  }

  @ApiOperation({
    summary:
      'Get the annotation pages with this identifier, in a project the user can read',
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get('/:annotPageId/:projectId')
  async findAll(
    @Param('projectId') projectId: number,
    @Param('annotPageId') annotPageId: string,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        return this.annotationPageService.findAll(annotPageId, projectId);
      },
    );
  }

  @ApiOperation({
    summary:
      'Get one annotation page (not reachable: same address as the route above)',
  })
  @SetMetadata('action', ActionType.READ)
  @UseGuards(AuthGuard)
  @Get(':annotationPageId/:projectId')
  async findOne(
    @Param('annotationPageId') annotationPageId: string,
    @Param('projectId') projectId: number,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        const decodedURI = decodeURIComponent(annotationPageId);
        return this.annotationPageService.findOne(decodedURI, projectId);
      },
    );
  }

  @ApiOperation({
    summary: 'Delete an annotation page of a project the user can update',
  })
  @SetMetadata('action', ActionType.UPDATE)
  @UseGuards(AuthGuard)
  @Delete('/:annotationPageId/:projectId')
  async delete(
    @Param('projectId') projectId: number,
    @Param('annotationPageId') annotationPageId: string,
    @Req() request,
  ) {
    return await this.linkGroupProjectService.checkPolicies(
      request.metadata.action,
      request.user.sub,
      projectId,
      async () => {
        const decodedURI = decodeURIComponent(annotationPageId);
        return this.annotationPageService.deleteAnnotationPage(
          decodedURI,
          projectId,
        );
      },
    );
  }
}
