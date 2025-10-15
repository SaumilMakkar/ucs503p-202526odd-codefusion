import { Env } from "../config/env.config";
import { resend } from "../config/resend.config";
import { twilioClient } from "../config/twilio.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

type WhatsAppParams = {
  to: string; // Phone number in format: whatsapp:+1234567890
  message: string;
};

const mailer_sender = `Finora <${Env.RESEND_MAILER_SENDER || 'onboarding@resend.dev'}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params): Promise<any> => {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });
};

export const sendWhatsAppMessage = async ({
  to,
  message,
}: WhatsAppParams): Promise<any> => {
  // Clean up FROM number - remove any leading + before whatsapp:
  const fromNumber = Env.TWILIO_WHATSAPP_FROM.replace(/^\+whatsapp:/, 'whatsapp:');
  
  console.log('📱 Sending WhatsApp message:');
  console.log('  From:', fromNumber);
  console.log('  To:', to);
  console.log('  Message length:', message.length);
  
  try {
    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: to,
      body: message,
    });
    console.log('✅ WhatsApp sent successfully:', result.sid);
    return result;
  } catch (error: any) {
    console.error('❌ WhatsApp sending failed:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};