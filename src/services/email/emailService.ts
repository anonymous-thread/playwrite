import 'dotenv/config';
import { BulkMailer } from '../../controllers/mailSender.controller';
import TemplateService from '../../services/email/TemplateService';
import NodeMailerProvider from '../../services/email/providers/NodeMailerProvider';

interface EmailData {
  email: string | string[];
  partnerName: string;
}
async function sendEmail(data: EmailData[]) {
  const templateService = new TemplateService('src/services/email/template/ops-institute.html');
  const emailProvider = new NodeMailerProvider();
  const bulkMailer = new BulkMailer(data, templateService, emailProvider);

  await bulkMailer.sendAll();
}

export default sendEmail;
