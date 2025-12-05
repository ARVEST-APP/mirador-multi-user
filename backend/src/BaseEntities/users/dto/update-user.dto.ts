import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Language } from '../../../utils/email/utils';
import { Matches } from 'class-validator';
import { PASSWORD_MINIMUM_LENGTH } from 'src/auth/utils';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  password?: string;

  @Matches(new RegExp("^.{0}$|^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])(.){" + PASSWORD_MINIMUM_LENGTH + ",}$"))
  newPassword?: string;
  confirmPassword?: string;
  resetToken?: string;
  lastConnectedAt?: Date;
  preferredLanguage?: Language;
  isEmailConfirmed?: boolean;
  termsValidatedAt?: Date;
}
