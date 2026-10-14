import { Repository } from 'typeorm';
import { LinkUserGroupService } from './link-user-group.service';
import { LinkUserGroup } from './entities/link-user-group.entity';
import { UserGroupService } from '../../BaseEntities/user-group/user-group.service';
import { UsersService } from '../../BaseEntities/users/users.service';
import { EmailServerService } from '../../utils/email/email.service';
import { LinkMetadataFormatGroupService } from '../link-metadata-format-group/link-metadata-format-group.service';
import { CreateUserDto } from '../../BaseEntities/users/dto/create-user.dto';
import { Language } from '../../utils/email/utils';

describe('LinkUserGroupService.createUser', () => {
  const SAVED_USER = {
    id: 7,
    mail: 'someone@example.org',
    name: 'Someone',
    password: 'the-stored-hash',
    resetToken: null,
    preferredLanguage: Language.FRENCH,
    isEmailConfirmed: false,
  };
  const signUp = () =>
    ({
      mail: SAVED_USER.mail,
      name: SAVED_USER.name,
      password: 'a password typed by the user',
      preferredLanguage: SAVED_USER.preferredLanguage,
    }) as unknown as CreateUserDto;
  const service = new LinkUserGroupService(
    {} as unknown as Repository<LinkUserGroup>,
    {
      create: jest.fn().mockResolvedValue({ id: 11 }),
    } as unknown as UserGroupService,
    {
      create: jest.fn(async () => ({ ...SAVED_USER })),
    } as unknown as UsersService,
    {} as unknown as EmailServerService,
    {
      createMetadataFormat: jest.fn(),
    } as unknown as LinkMetadataFormatGroupService,
  );
  const smtpDomain = process.env.SMTP_DOMAIN;

  beforeEach(() => {
    jest.spyOn(service, 'create').mockResolvedValue(undefined);
    jest.spyOn(service, 'sendConfirmationLink').mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env.SMTP_DOMAIN = smtpDomain;
    jest.restoreAllMocks();
  });

  it.each([
    ['a mail server is configured', 'smtp.example.org'],
    ['no mail server is configured', ''],
  ])(
    'answers with the created user, without password or reset token, when %s',
    async (_case, domain) => {
      process.env.SMTP_DOMAIN = domain;

      const answer = await service.createUser(signUp());

      expect(answer).toEqual({
        id: SAVED_USER.id,
        mail: SAVED_USER.mail,
        name: SAVED_USER.name,
        preferredLanguage: SAVED_USER.preferredLanguage,
        isEmailConfirmed: SAVED_USER.isEmailConfirmed,
      });
    },
  );
});
