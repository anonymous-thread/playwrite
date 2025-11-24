import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions } from './EmailProvider';
import { ENV } from '../../../context/env';

export class NodeMailerProvider extends EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: ENV.SMTP.HOST,
      port: ENV.SMTP.PORT,
      secure: false,
      auth: {
        user: ENV.SMTP.USER,
        pass: ENV.SMTP.PASS
      }
    });
  }

  async send(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: options.from || ENV.SMTP.USER,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
  }
}

export default NodeMailerProvider;
