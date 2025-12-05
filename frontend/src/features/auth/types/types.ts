import { z, ZodSchema, ZodType } from 'zod';
import { UserGroup } from '../../user-group/types/types.ts';
import { PasswordCheck } from 'components/elements/FormField.tsx';

/// from backend
export enum Language {
  ENGLISH = 'en',
  FRENCH = 'fr',
}

interface CreateUserDto {
  mail: string;
  name: string;
  password: string;
  newPassword: string;
  preferredLanguage: Language;
}

interface UpdateUserDto extends Omit<CreateUserDto, 'password' | 'newPassword' | 'preferredLanguage'> {
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
  resetToken?: string;
  lastConnectedAt?: Date;
  preferredLanguage?: Language;
  isEmailConfirmed?: boolean;
  termsValidatedAt?: Date;
}

interface loginDto {
  mail: string;
  password: string;
  isImpersonate?: string
}
/// end from backend

export type User = {
  access_token: string;
  id: number;
  mail: string;
  name: string;
  userGroups: UserGroup[];
  _isAdmin: boolean;
  isEmailConfirmed: boolean;
  createdAt: Date;
  preferredLanguage: string;
  termsValidatedAt: Date;
};


export type UserResponse = {
  access_token: string;
  user: User;
};

export type UpdateFormData = Omit<UpdateUserDto, "mail" | "name"> & {
  mail: string;
  name: string;
};

export type RegisterFormData = Omit<CreateUserDto, "preferredLanguage" | "password"> & {
  // password?: string;
  confirmMail: string;
  confirmPassword: string;
};

export type LoginFormData = loginDto & {
  isImpersonate?: string;
};

export type ForgotPasswordFormData = {
  mail: string
}

export type ResetPasswordFormData = {
  newPassword: string,
  confirmPassword: string
}

const Mail = z
  .string({
    required_error: 'requiredField',
    invalid_type_error: 'Email must be a string',
  })
  .email({
    message: `mailIsNotValid`
  });

const MailCheck = z.object({
  mail: Mail,
  confirmMail: z.string()
})
  .superRefine(({ mail, confirmMail }, ctx: z.RefinementCtx) => {
    if (mail) {
      if (!confirmMail) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `requiredField`, path: ['confirmMail'] })
      }
      if ((mail as string).toLowerCase() !== (confirmMail as string).toLowerCase()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `emailMismatch`, path: ['confirmMail'] })
      }
    }
  })

const UserCredentials = z.object({
  mail: Mail.min(1, { message: 'requiredField' }),
  password: z.string({
    required_error: 'requiredField'
  }).min(1, { message: 'requiredField' }),
});

const CreateNewPassword = z.object({
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional()
})

const passwordCheck = ({ newPassword, confirmPassword }: z.infer<typeof CreateNewPassword>, ctx: z.RefinementCtx) => {
  if (newPassword && newPassword.length > 0) {

    // Password check
    let message = '';
    PasswordCheck.forEach(criteria => {
      if (!criteria.regexValidation.test(newPassword))
        message += ';' + criteria.name;
    });

    if (message !== '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: message, path: ['newPassword'] })
    }

    // Confirmation password check
    if (confirmPassword === undefined || confirmPassword.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `requiredField`, path: ['confirmPassword'] })
    }

    if (newPassword !== confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `passwordMismatch`, path: ['confirmPassword'] })
    }
  }
}

const NewRequiredPassword = z.object({
  newPassword: z.string(),
  confirmPassword: z.string()
}).superRefine(passwordCheck);

const NewOptionalPassword = CreateNewPassword.superRefine(passwordCheck);

const UserInformation = z.object({
  ...UserCredentials.shape,
  name: z.string({
    required_error: 'requiredField',
    invalid_type_error: 'Name must be a string',
  }).min(1, { message: 'requiredField' })
});

export const RegisterSchema: ZodType<RegisterFormData> = z.intersection(MailCheck, z.intersection(NewRequiredPassword, z.object({
  ...UserInformation.shape,
  password: UserInformation.shape.password.optional(),
}))).refine((data) => data.newPassword, { message: `requiredField`, path: ['newPassword'] });

export const LoginSchema: ZodSchema<LoginFormData> = UserCredentials;


let initialMail: string = "";

export const setInitialMail = z.function().args(z.string()).returns(z.void()).implement((x) => { initialMail = x; });

export const UpdateUserSchema: ZodType<UpdateFormData> = z.intersection(NewOptionalPassword, z.object({
  ...UserCredentials.shape,
  ...UserInformation.shape,
  password: z.string().optional(),
})).superRefine(({ mail, newPassword }, ctx: z.RefinementCtx) => {
  // Required error only if the user email have been modified or if a new password is created
  if ((mail && mail !== initialMail) || (newPassword && newPassword.length !== 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `requiredField`, path: ['password'] })
  }
});

export const ForgotPasswordSchema: ZodType<ForgotPasswordFormData> = z.object({
  mail: Mail
});

export const ResetPasswordSchema: ZodType<ResetPasswordFormData> = NewRequiredPassword;