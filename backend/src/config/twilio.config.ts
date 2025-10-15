import twilio from 'twilio';
import { Env } from './env.config';

export const twilioClient = twilio(
  Env.TWILIO_ACCOUNT_SID,
  Env.TWILIO_AUTH_TOKEN
);

