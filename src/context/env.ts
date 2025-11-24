import 'dotenv/config';

export const ENV = {
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: parseInt(process.env.SMTP_PORT || '0'),
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
  },
};
