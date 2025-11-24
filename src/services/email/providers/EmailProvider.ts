export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export abstract class EmailProvider {
  abstract send(options: EmailOptions): Promise<void>;
}

export default EmailProvider;
