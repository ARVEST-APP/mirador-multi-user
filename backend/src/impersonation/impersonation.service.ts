import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Impersonation } from './entities/impersonation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../BaseEntities/users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger } from '../utils/Logger/CustomLogger.service';
import { JwtService } from '@nestjs/jwt';
import { ImpersonateDto } from './dto/impersonateDto';

@Injectable()
export class ImpersonationService {
  private readonly logger = new CustomLogger();

  constructor(
    @InjectRepository(Impersonation)
    private readonly impersonationRepository: Repository<Impersonation>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async initiateImpersonation(
    adminUserId: number,
    userId: number,
  ): Promise<Impersonation> {
    try {
      // Check if admin user exists and is an admin
      const adminUser = await this.userService.findAdminUser(adminUserId);
      if (!adminUser) {
        throw new Error('Only admin users can create impersonation tokens');
      }

      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create a new impersonation record
      const token = uuidv4();
      const exchangeBefore = new Date(Date.now() + 20 * 60 * 1000);

      const impersonation = this.impersonationRepository.create({
        adminUser,
        user,
        token,
        exchangeBefore,
        used: false,
      });

      return this.impersonationRepository.save(impersonation);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'an error occurred while creating impersonation',
      );
    }
  }

  private async findPendingImpersonation(
    token: string,
  ): Promise<Impersonation> {
    // TypeORM ignores an undefined value in `where`: without this check a
    // request without token would match any impersonation not yet used.
    if (typeof token !== 'string' || token === '') {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const impersonation = await this.impersonationRepository.findOne({
      where: { token, used: false },
      relations: ['user', 'adminUser'],
    });
    if (
      !impersonation ||
      !impersonation.user ||
      new Date() > impersonation.exchangeBefore
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return impersonation;
  }

  private async markUsed(impersonation: Impersonation): Promise<void> {
    // `used: false` in the criteria: of two exchanges at the same time, one fails.
    const result = await this.impersonationRepository.update(
      { id: impersonation.id, used: false },
      { used: true },
    );
    if (result.affected !== 1) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async consumeToken(token: string): Promise<Impersonation> {
    const impersonation = await this.findPendingImpersonation(token);
    await this.markUsed(impersonation);
    return impersonation;
  }

  async impersonateUserData(
    impersonateDto: ImpersonateDto,
    adminUserId: number,
  ): Promise<{ access_token: string }> {
    try {
      const impersonation = await this.findPendingImpersonation(
        impersonateDto.token,
      );
      if (Number(impersonation.adminUser?.id) !== Number(adminUserId)) {
        this.logger.warn(
          `Impersonation refused: user ID ${adminUserId} did not create impersonation ${impersonation.id}`,
        );
        throw new ForbiddenException('You are not allowed to impersonate user');
      }
      const user = impersonation.user;
      // The pass is signed for the token's user, never for the body's userId. A
      // body naming someone else is refused, not ignored: the caller would
      // otherwise be logged in as a user it did not ask for.
      if (
        impersonateDto.userId != undefined &&
        Number(impersonateDto.userId) !== Number(user.id)
      ) {
        this.logger.warn(
          `Impersonation refused: impersonation ${impersonation.id} was not created for user ID ${impersonateDto.userId}`,
        );
        throw new ForbiddenException('You are not allowed to impersonate user');
      }
      await this.markUsed(impersonation);

      const payload = {
        sub: user.id,
        user: user.name,
        isEmailConfirmed: user.isEmailConfirmed,
        termsValidatedAt: user.termsValidatedAt,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'an error occurred while impersonating the user',
      );
    }
  }
}
