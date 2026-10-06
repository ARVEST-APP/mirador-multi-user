import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailServerService } from './email.service';
import { escapeHtml, maskEmails } from './utils';

describe('maskEmails', () => {
  it('replaces every e-mail address, percent-encoded or not', () => {
    expect(
      maskEmails(
        'No user found for email: jane.doe+test@example.org (/resend/jane%40example.org/fr)',
      ),
    ).toBe('No user found for email: [e-mail] (/resend/[e-mail]/fr)');
  });

  it('replaces an address with accented letters', () => {
    expect(maskEmails('rejected <josé.núñez@université.fr>')).toBe(
      'rejected <[e-mail]>',
    );
  });

  // Without the length limit in the pattern this takes about 20 seconds,
  // during which the server would answer nobody; with it, a few milliseconds.
  it('stays fast on a very long text', () => {
    const longText = 'a'.repeat(200_000);
    const start = Date.now();

    expect(maskEmails(longText)).toBe(longText);
    expect(Date.now() - start).toBeLessThan(2000);
  });

  it('leaves a text without address unchanged', () => {
    const stackLine =
      'at Router.handle (/app/node_modules/@nestjs/core/router.js:42:7)';
    expect(maskEmails(stackLine)).toBe(stackLine);
  });
});

describe('escapeHtml', () => {
  it('escapes the characters that would be read as HTML', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    );
  });
});

describe('EmailServerService.sendInternalServerErrorNotification', () => {
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const service = new EmailServerService(
    { sendMail } as unknown as MailerService,
    {} as JwtService,
  );
  const previousEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    // The service's logger writes to a file: not wanted in a test.
    (service as any).logger = { log: jest.fn(), error: jest.fn() };
    process.env.SMTP_DOMAIN = 'smtp.example.org';
    process.env.ADMIN_MAIL = 'admin@example.org';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...previousEnv };
  });

  it('sends the route, the field names and the user id, with no e-mail address', async () => {
    await service.sendInternalServerErrorNotification({
      message: 'No user found for email: jane@example.org',
      route: '/link-user-group/resend-confirmation-link/:email/:language',
      method: 'POST',
      timestamp: '2026-10-06T10:00:00.000Z',
      bodyFields: ['token', 'password'],
      userId: 7,
      stack: 'Error: User no found jane@example.org\n    at somewhere',
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe('admin@example.org');
    const sent = `${mail.subject}\n${mail.html}\n${mail.text}`;
    expect(sent).not.toContain('jane');
    expect(sent).toContain('[e-mail]');
    expect(mail.subject).toContain(
      '/link-user-group/resend-confirmation-link/:email/:language',
    );
    expect(mail.html).toContain(
      '<strong>Route:</strong> /link-user-group/resend-confirmation-link/:email/:language',
    );
    expect(mail.html).toContain('<p>token, password</p>');
    expect(mail.html).toContain('<strong>ID:</strong> 7');
  });

  it('escapes what goes into the HTML of the alert', async () => {
    await service.sendInternalServerErrorNotification({
      message: 'failed <img src="https://example.org/x.png">',
      route: '/things/:id',
      method: 'GET',
      timestamp: '2026-10-06T10:00:00.000Z',
      bodyFields: ['<b>field</b>'],
      userId: 7,
      stack: 'Error: <script>alert(1)</script>',
    });

    const mail = sendMail.mock.calls[0][0];
    expect(mail.html).not.toContain('<img');
    expect(mail.html).not.toContain('<b>field');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('failed &lt;img src=&quot;');
  });

  it('says so when the request came from nobody logged in, with no body', async () => {
    await service.sendInternalServerErrorNotification({
      message: 'boom',
      route: '/auth/login',
      method: 'POST',
      timestamp: '2026-10-06T10:00:00.000Z',
      bodyFields: [],
      userId: undefined,
      stack: '',
    });

    const mail = sendMail.mock.calls[0][0];
    expect(mail.html).toContain('<strong>ID:</strong> not logged in');
    expect(mail.html).toContain('<p>none</p>');
    expect(mail.html).toContain('No stack trace available');
  });
});
