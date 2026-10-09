import { IsString } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { UserGroupTypes } from '../../../enum/user-group-types';

export class CreateUserGroupDto {
  @IsString()
  title: string;

  ownerId: number;

  // Optional, and only its `id` is read: the owner and first admin of a new
  // group is always the logged in user. Another user's id is refused with a 403.
  user?: User;

  type: UserGroupTypes;
}
