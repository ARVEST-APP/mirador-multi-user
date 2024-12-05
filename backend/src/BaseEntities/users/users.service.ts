import {
  BadGatewayException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CustomLogger } from '../../utils/Logger/CustomLogger.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new CustomLogger();

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    try {
      if ('_isAdmin' in updateUserDto || 'admin' in updateUserDto) {
        throw new UnauthorizedException('Admin field cannot be updated.');
      }
      console.log('updateUser', updateUserDto);
      const { oldPassword, confirmPassword, newPassword, ...newDto } =
        updateUserDto;
      let dto = newDto;
      const userToUpdate = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (newPassword) {
        const isMatch = await bcrypt.compare(
          oldPassword,
          userToUpdate.password,
        );
        if (!isMatch && confirmPassword === newPassword) {
          throw new UnauthorizedException();
        }
        const salt = await bcrypt.genSalt();
        const hashedUpdatedPassword = await bcrypt.hash(newPassword, salt);
        dto = { ...dto, password: hashedUpdatedPassword };
      }
      return await this.userRepository.update(userId, dto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.error(error.message, error.stack);
        throw new InternalServerErrorException(
          'Someone try to promote a user to Admin',
        );
      }
      this.logger.error(error.message, error.stack);
      throw new UnauthorizedException(
        'An error occurred while updating the user',
      );
    }
  }
  async create(dto: CreateUserDto): Promise<User> {
    try {
      if ('_isAdmin' in dto || 'admin' in dto) {
        throw new InternalServerErrorException('Admin field cannot be set.');
      }
      return await this.userRepository.save(dto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.error(error.message, error.stack);
        throw new InternalServerErrorException(
          'Someone try to promote a user to Admin',
        );
      }
      if (error instanceof QueryFailedError) {
        this.logger.warn(`Conflict during user creation: ${error.message}`);
        throw new ConflictException('A user with this email already exists.');
      }
      this.logger.error(
        `Unexpected error during user creation: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user',
      );
    }
  }

  async findOneByMail(mail: string): Promise<User> {
    try {
      return await this.userRepository.findOneBy({ mail });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new NotFoundException(`User no found ${mail}`);
    }
  }
  async findOne(id: number): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: { id },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new NotFoundException(`User not found :${id}`);
    }
  }

  async markEmailAsConfirmed(mail: string) {
    try {
      return this.userRepository.update(
        { mail },
        {
          isEmailConfirmed: true,
        },
      );
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new NotFoundException(`User no found ${mail}`);
    }
  }
  async getByEmail(mail: string) {
    try {
      return await this.userRepository.findOne({ where: { mail: mail } });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadGatewayException(
        `Impossible to update user with mail : ${mail}`,
      );
    }
  }

  async deleteUser(userId: number) {
    try {
      return await this.userRepository.delete(userId);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `An error occurred while deleting user with id : ${userId}`,
      );
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'an error occurred while getting all users',
      );
    }
  }

  async findAdminUser(adminId: number): Promise<User> {
    try {
      return await this.userRepository.findOne({
        where: { id: adminId, _isAdmin: true },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        `no admin found with id : ${adminId}`,
      );
    }
  }
}
