import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { LinkMetadataFormatGroupService } from './link-metadata-format-group.service';
import { CreateLinkMetadataFormatGroupDto } from './dto/create-link-metadata-format-group.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { ownerFromCaller } from '../../utils/ownerFromCaller';

@Controller('link-metadata-format-group')
export class LinkMetadataFormatGroupController {
  constructor(
    private readonly linkMetadataFormatGroupService: LinkMetadataFormatGroupService,
  ) {}

  @ApiOperation({
    summary: 'createMetadataFormat',
    description:
      'The creator is the logged in user: `creatorId` may be left out, another id answers 403. Only `title` and `metadata` are read from the rest of the body.',
  })
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createLinkMetadataFormatGroupDto: CreateLinkMetadataFormatGroupDto,
    @Req() request,
  ) {
    return this.linkMetadataFormatGroupService.createMetadataFormat({
      ...createLinkMetadataFormatGroupDto,
      creatorId: ownerFromCaller(
        createLinkMetadataFormatGroupDto.creatorId,
        request.user.sub,
        'metadata format',
      ),
    });
  }

  @ApiOperation({ summary: 'getMetadataFormatForUser' })
  @UseGuards(AuthGuard)
  @Get('/:userId')
  getMetadataFormatForUser(@Param('userId') userId: number, @Req() request) {
    if (userId == request.user.sub) {
      return this.linkMetadataFormatGroupService.getMetadataFormatForUser(
        userId,
      );
    } else {
      throw new UnauthorizedException();
    }
  }
}
