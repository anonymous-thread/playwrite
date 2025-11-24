import 'dotenv/config';
import { BulkMailer } from '../controllers/mailSender.controller';
import TemplateService from '../services/email/TemplateService';
import NodeMailerProvider from '../services/email/providers/NodeMailerProvider';

async function testEmail() {
  const data = [
    {
      email: 'princerajsde@gmail.com',
      partnerName: 'Prince'
    },
    {
      email: 'anuprahangdale201999@gmail.com',
      partnerName: 'Anup'
    },
    {
      email: 'theakashkumar01@gmail.com',
      partnerName: 'Akash'
    },
    {
      email: 'harshsukhijacse@gmail.com',
      partnerName: 'Harsh'
    },
    {
      email:"vanshika0606rajput@gmail.com",
      partnerName:"Vanshika"
    }
  ];

  const templateService = new TemplateService('src/services/email/template/ops-institute.html');
  const emailProvider = new NodeMailerProvider();
  const bulkMailer = new BulkMailer(data, templateService, emailProvider);

  await bulkMailer.sendAll();
}

testEmail().catch(console.error);
