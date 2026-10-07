import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { ImpersonationService } from './impersonation.service';
import { AuthGuard } from '../auth/auth.guard';
import { ImpersonateDto } from './dto/impersonateDto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('impersonation')
export class ImpersonationController {
  constructor(private readonly impersonationService: ImpersonationService) {}

  @ApiOperation({
    summary: 'Create an impersonation token for a user (administrators only)',
  })
  @UseGuards(AuthGuard)
  @Post(':id/impersonate')
  async impersonateUser(@Param('id') userId: number, @Req() req, @Res() res) {
    const adminUserId = req.user.sub;
    const impersonation = await this.impersonationService.initiateImpersonation(
      adminUserId,
      userId,
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/impersonate/?token=${impersonation.token}`;

    return res.json({ redirectUrl: redirectUrl, user: impersonation.user });
  }

  @ApiOperation({
    summary:
      'Use an impersonation token to get an access token for the impersonated user',
    description:
      'Only the administrator who created the impersonation token can use it, and only once.',
  })
  @UseGuards(AuthGuard)
  @Post('/impersonate')
  async impersonate(@Body() impersonateDto: ImpersonateDto, @Req() req) {
    return this.impersonationService.impersonateUserData(
      impersonateDto,
      req.user.sub,
    );
  }
}
