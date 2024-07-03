import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, In, QueryFailedError, Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserGroup } from '../user-group/entities/user-group.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly data: Repository<User>,

    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}
  async create(dto: CreateUserDto): Promise<User> {
    try {
      console.log(dto);
      let userToSave = dto;
      const hashPassword = await bcrypt.hash(dto.password, 10);
      userToSave.password = hashPassword;
      let userGroups: UserGroup[] = [];
      if (dto.userGroupIds && dto.userGroupIds.length > 0) {
        userGroups = await this.userGroupRepository.find({
          where: { id: In(dto.userGroupIds) },
        });
      }
      userToSave = { ...userToSave, user_groups: userGroups };
      const savedUser = await this.data.save(userToSave);
      return savedUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('This user already exists');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while creating the user',
        );
      }
    }
  }

  findAll(): Promise<User[]> {
    return this.data.find();
  }

  async findOneByMail(mail: string): Promise<User> {
    try {
      return await this.data.findOneBy({ mail });
    } catch (err) {
      throw new NotFoundException(`User no found ${mail}`);
    }
  }
  async findOne(id: number): Promise<User> {
    try {
      return await this.data.findOneBy({ id });
    } catch (err) {
      throw new NotFoundException(`User not found :${id}`);
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      const done = await this.data.update(id, dto);
      if (done.affected != 1) throw new NotFoundException(id);
      return this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: number) {
    try {
      const done: DeleteResult = await this.data.delete(id);
      if (done.affected != 1) throw new NotFoundException(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
