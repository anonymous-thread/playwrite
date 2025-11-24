import TemplateService from '../services/email/TemplateService';
import EmailProvider from '../services/email/providers/EmailProvider';
import { emailConfig } from '../config/email.config';

interface EmailData {
  instituteName?: string;
  email: string;
  [key: string]: any;
}

export class BulkMailer {
  private data: EmailData[];
  private templateService: TemplateService;
  private emailProvider: EmailProvider;

  constructor(data: EmailData[], templateService: TemplateService, emailProvider: EmailProvider) {
    this.data = data;
    this.templateService = templateService;
    this.emailProvider = emailProvider;
  }

  async sendAll(): Promise<void> {
    const {
      sender: { name: senderName, email: senderEmail, phone: senderPhone, role: senderRole },
      email: { subject: emailSubject },
      company: { name: companyName, tagline: companyTagline, logoUrl, websiteUrl }
    } = emailConfig;

    console.log(`Starting to send ${this.data.length} emails...`);

    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i];
      
      try {
        const html = this.templateService.render({
          instituteName: row.instituteName || 'Valued Partner',
          senderName,
          senderEmail,
          senderPhone,
          logoUrl,
          companyName,
          companyTagline,
          senderRole,
          websiteUrl,
          ...row
        });

        await this.emailProvider.send({
          to: row.email,
          subject: emailSubject,
          html,
          from: senderEmail
        });

        console.log(`✅ [${i + 1}/${this.data.length}] Mail sent → ${row.email}`);
        
        // Optional delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`❌ [${i + 1}/${this.data.length}] Failed to send to ${row.email}:`, error);
      }
    }

    console.log(`\n✅ Completed sending ${this.data.length} emails.`);
  }
}