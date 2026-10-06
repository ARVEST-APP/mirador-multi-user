import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService as MailerMain } from '@nestjs-modules/mailer';
import { MailService } from './IMailService';
import { CustomLogger } from '../Logger/CustomLogger.service';
import { ConfirmationEmailDto } from './Dto/ConfirmationEmailDto';
import { confirmationEmailTemplateEnglish } from './templates/confirmationMail/English';
import { JwtService } from '@nestjs/jwt';
import { resetPasswordEnglish } from './templates/resetPassword/ResetPasswordEnglish';
import { ResetPasswordEmailDto } from './Dto/resetPasswordEmailDto';
import { confirmationEmailTemplateFrench } from './templates/confirmationMail/French';
import { escapeHtml, Language, maskEmails } from './utils';
import { resetPasswordFrench } from './templates/resetPassword/French';

@Injectable()
export class EmailServerService implements MailService {
  private readonly logger = new CustomLogger();

  constructor(
    private readonly mailerMain: MailerMain,
    private readonly jwtService: JwtService,
  ) {}

  private _confirmMailTemplate(
    url: string,
    name: string,
    language: string,
  ): string {
    // The name is chosen freely at sign-up: escaped before it goes into the HTML.
    const safeName = escapeHtml(name);
    switch (language) {
      case Language.ENGLISH:
        return confirmationEmailTemplateEnglish({ url, name: safeName });
      case Language.FRENCH:
        return confirmationEmailTemplateFrench({ url, name: safeName });
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  private _passwordResetTemplate(
    url: string,
    name: string,
    language: Language,
  ): string {
    // The name is chosen freely at sign-up: escaped before it goes into the HTML.
    const safeName = escapeHtml(name);
    switch (language) {
      case Language.ENGLISH:
        return resetPasswordEnglish({ url, name: safeName });
      case Language.FRENCH:
        return resetPasswordFrench({ url, name: safeName });
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  //UNCOMMENT FOR TESTS
  async sendMailSandBox() // email: CreateEmailServerDto
  : Promise<void> {
    //   // Generate the template directly using the data
    //   const renderedTemplate = this._bodyTemplate();
    //
    //   // Send the email with the rendered HTML
    //   await this._processSendEmail(
    //     email.to,
    //     email.subject,
    //     email.text,
    //     renderedTemplate,
    //   );
    // }
    //
    // /**
    //  * Generate the HTML email body from the given data using a template.
    //  *
    //  * @param {Object} data - The data object to be passed to the template.
    //  * @return {string} The rendered HTML template.
    //  */
    // _bodyTemplate(): string {
    //   // Use the template function to generate the HTML content
    //   return accountCreationTemplate({
    //     userName: 'Antoine',
    //   });
  }

  async sendInternalServerErrorNotification(details: {
    message: string;
    route: string;
    method: string;
    timestamp: string;
    bodyFields: string[];
    userId?: number;
    stack: string;
  }) {
    if (!process.env.SMTP_DOMAIN) {
      return;
    }

    console.log('Send mail internal server error');

    // The alert leaves the server: e-mail addresses are masked wherever they
    // come from, and every text is escaped before it goes into the HTML.
    const forAlert = (text: string) => escapeHtml(maskEmails(text));

    // The subject is plain text: masked, not escaped.
    const subject = `🚨 Internal Server Error: ${maskEmails(details.route)}`;

    const formattedStack = details.stack
      ? `<pre style="background: #fee; padding: 10px; border-radius: 5px; white-space: pre-wrap; color: darkred;">${forAlert(details.stack)}</pre>`
      : '<p>No stack trace available</p>';

    const mailBody = `
    <h2 style="color: red;">🚨 Internal Server Error</h2>
    <p><strong>Route:</strong> ${forAlert(details.route)}</p>
    <p><strong>Method:</strong> ${forAlert(details.method)}</p>
    <p><strong>Message:</strong> ${forAlert(details.message)}</p>
    <h3>User</h3>
    <p><strong>ID:</strong> ${forAlert(String(details.userId ?? 'not logged in'))}</p>
    <h3>Request Body Fields</h3>
    <p>${forAlert(details.bodyFields.join(', ') || 'none')}</p>
    <p><strong>Timestamp:</strong> ${forAlert(details.timestamp)}</p>
    <h3>Stack Trace</h3>
    ${formattedStack}
  `;

    await this.sendMail({
      to: process.env.ADMIN_MAIL,
      subject: subject,
      body: mailBody,
      text: mailBody,
    });
  }

  async sendConfirmationEmail(email: ConfirmationEmailDto): Promise<void> {
    try {
      if (!Boolean(process.env.SMTP_DOMAIN)) {
        return;
      }
      const token = this.jwtService.sign(
        { email: email.to },
        {
          secret: process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET,
          expiresIn: '2100s',
        },
      );

      const url = `${process.env.FRONTEND_URL}/token/${token}`;

      const renderedTemplate = this._confirmMailTemplate(
        url,
        email.userName,
        email.language,
      );
      const plainText = `Welcome to ${process.env.INSTANCE_NAME}. To confirm the email address, click here: ${url}`;
      return await this.sendMail({
        to: email.to,
        subject: email.subject,
        text: plainText,
        body: renderedTemplate,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException('an error occurred', error);
    }
  }

  async sendMail(content: {
    subject: string;
    to: string;
    text: string;
    body: string;
  }): Promise<void> {
    try {
      await this.mailerMain.sendMail({
        to: content.to,
        subject: `[${process.env.INSTANCE_NAME}] ${content.subject}`,
        text: content.text,
        html: content.body,
      });
      this.logger.log(
        `email sent to : ${content.to} with subject ${content.subject}`,
      );
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new InternalServerErrorException('Failed to send email', error);
    }
  }

  async sendResetPasswordLink(email: ResetPasswordEmailDto): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/reset-password/${email.token}`;

    const renderedTemplate = this._passwordResetTemplate(
      url,
      email.userName,
      email.language,
    );
    const plainText = `Hi, \\nTo reset your password, click here: ${url}`;

    return await this.sendMail({
      to: email.to,
      subject: 'Reset password',
      text: plainText,
      body: renderedTemplate,
    });
  }
}
