import { z, ZodType } from 'zod';
import { UserGroup } from '../../user-group/types/types.ts';
import { PASSWORD_MINIMUM_LENGTH } from '../../../utils/utils.ts';

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

export type UpdateUserDto = {
  mail?: string;
  name?: string;
  password?: string;
  newPassword?: string;
};

export type UserResponse = {
  access_token: string;
  user: User;
};

export type RegisterFormData = {
  name: string;
  mail: string;
  confirmMail: string,
  password: string;
  confirmPassword: string;
};

export type LoginFormData = {
  mail: string;
  password: string;
};

//Test

// const mail = z.object({
//   mail: z
//     .string({
//       required_error: 'requiredField',
//       invalid_type_error: 'Email must be a string',
//     }).min(1, { message: 'requiredField' })
//     .email({
//       message: `mailIsNotValid`
//     })
// });

// const confirmMail = mail.extend({
//   confirmMail: z.string({
//     required_error: 'requiredField'
//   }).min(1, { message: 'requiredField' })
// }).refine((data) => data.mail.toLowerCase() === data.confirmMail.toLowerCase(), {
//   message: `emailMismatch`,
//   path: ['confirmMail'],
// })

// const name = z.object({
//   name: z.string({
//     required_error: 'requiredField',
//     invalid_type_error: 'Name must be a string',
//   }).min(1, { message: 'requiredField' })
// });

// const password = z.object({
//   password: z.string().min(PASSWORD_MINIMUM_LENGTH, { message: `characterLimitForPassword` })
// })

// const confirmPassword = password.extend({
//   confirmPassword: z.string().min(1, { message: 'requiredField' }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: `passwordMismatch`,
//   path: ['confirmPassword'],
// })

// const registerFormZObject = z.object({
//   ...mail.shape,
//   ...confirmMail._def.schema.shape,
//   ...name.shape,
//   ...password.shape,
//   ...confirmPassword._def.schema.shape
// }).refine((data) => data.password === data.confirmPassword, {
//   message: `passwordMismatch`,
//   path: ['confirmPassword'],
// })
//   .refine((data) => data.mail.toLowerCase() === data.confirmMail.toLowerCase(), {
//     message: `emailMismatch`,
//     path: ['confirmMail'],
//   });

// export const UserSchema: ZodType<RegisterFormData> = registerFormZObject;

//TODO: Erell - Vérfifier que le Pseudo n'existe pas déjà
export const UserSchema: ZodType<RegisterFormData> = z
  .object({
    mail: z
      .string({
        required_error: 'requiredField',
        invalid_type_error: 'Email must be a string',
      }).min(1, { message: 'requiredField' })
      .email({
        message: `mailIsNotValid`
      }),
    confirmMail: z.string({
      required_error: 'requiredField'
    }).min(1, { message: 'requiredField' }),
    name: z.string({
      required_error: 'requiredField',
      invalid_type_error: 'Name must be a string',
    }).min(1, { message: 'requiredField' }),
    password: z.string().min(PASSWORD_MINIMUM_LENGTH, { message: `characterLimitForPassword` }),
    confirmPassword: z.string().min(1, { message: 'requiredField' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: `passwordMismatch`,
    path: ['confirmPassword'],
  })
  .refine((data) => data.mail.toLowerCase() === data.confirmMail.toLowerCase(), {
    message: `emailMismatch`,
    path: ['confirmMail'],
  });

export const LoginSchema: ZodType<LoginFormData> = z.object({
  mail: z
    .string({
      required_error: 'email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  password: z.string(),
});
