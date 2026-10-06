import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailServerService } from './email.service';
import { Language } from './utils';

// The name is chosen freely at sign-up, possibly by someone who signs up with
// another person's address: it must reach the e-mail as text, never as HTML.
describe('EmailServerService: the user name in the e-mails sent to users', () => {
  const HTML_NAME = '<a href="https://evil.example">Click here</a>';
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const service = new EmailServerService(
    { sendMail } as unknown as MailerService,
    { sign: () => 'signed-token' } as unknown as JwtService,
  );
  const previousEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    // The service's logger writes to a file: not wanted in a test.
    (service as any).logger = { log: jest.fn(), error: jest.fn() };
    process.env.SMTP_DOMAIN = 'smtp.example.org';
    process.env.FRONTEND_URL = 'https://arvest.example';
  });

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  const htmlSent = () => sendMail.mock.calls[0][0].html as string;

  it.each([Language.ENGLISH, Language.FRENCH])(
    'escapes it in the confirmation e-mail (%s)',
    async (language) => {
      await service.sendConfirmationEmail({
        to: 'someone@example.org',
        subject: 'Account creation',
        userName: HTML_NAME,
        language,
      });

      expect(htmlSent()).not.toContain('evil.example">');
      expect(htmlSent()).toContain('&lt;a href=&quot;https://evil.example');
      // the backend's own link is still a link
      expect(htmlSent()).toContain(
        '<a href="https://arvest.example/token/signed-token">',
      );
    },
  );

  it.each([Language.ENGLISH, Language.FRENCH])(
    'escapes it in the reset-password e-mail (%s)',
    async (language) => {
      await service.sendResetPasswordLink({
        to: 'someone@example.org',
        userName: HTML_NAME,
        token: 'reset-token',
        language,
      });

      expect(htmlSent()).not.toContain('evil.example">');
      expect(htmlSent()).toContain('&lt;a href=&quot;https://evil.example');
      expect(htmlSent()).toContain(
        '<a href="https://arvest.example/reset-password/reset-token">',
      );
    },
  );

  it('leaves an ordinary name as it is, accents included', async () => {
    await service.sendResetPasswordLink({
      to: 'someone@example.org',
      userName: 'Zoé Lefèvre',
      token: 'reset-token',
      language: Language.FRENCH,
    });

    expect(htmlSent()).toContain('Zoé Lefèvre');
  });
});
