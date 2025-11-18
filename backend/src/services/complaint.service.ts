import { sendEmail } from "../mailers/mailer";
import { ComplaintType } from "../validators/complaint.validator";

/**
 * Interface for complaint submission data
 * Uses Zod inferred type for exact type compatibility
 */
export type ComplaintData = ComplaintType;

/**
 * Generates HTML email template for complaint
 */
const getComplaintEmailTemplate = (data: ComplaintData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Complaint/Feedback Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Complaint/Feedback</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #667eea; margin-top: 0;">Complaint Details</h2>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="margin: 10px 0;"><strong style="color: #555;">Full Name:</strong> ${data.fullName}</p>
      <p style="margin: 10px 0;"><strong style="color: #555;">Email:</strong> <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a></p>
      ${data.phone ? `<p style="margin: 10px 0;"><strong style="color: #555;">Phone:</strong> ${data.phone}</p>` : ''}
      <p style="margin: 10px 0;"><strong style="color: #555;">Subject:</strong> ${data.subject}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h3 style="color: #555; margin-top: 0;">Message Details:</h3>
      <p style="white-space: pre-wrap; color: #333; line-height: 1.8;">${data.message}</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
      <p style="margin: 5px 0;">This complaint was submitted through the Finora Expense Tracker platform.</p>
      <p style="margin: 5px 0;">Submitted at: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generates plain text email for complaint
 */
const getComplaintEmailText = (data: ComplaintData): string => {
  return `
New Complaint/Feedback Submission

Complaint Details:
-----------------
Full Name: ${data.fullName}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Subject: ${data.subject}

Message Details:
----------------
${data.message}

---
This complaint was submitted through the Finora Expense Tracker platform.
Submitted at: ${new Date().toLocaleString()}
  `.trim();
};

/**
 * Service to send complaint email to admin
 * Sends email to saumilmakkar@gmail.com
 */
export const submitComplaintService = async (
  data: ComplaintData
): Promise<void> => {
  try {
    const recipientEmail = "saumilmakkar@gmail.com";
    
    const html = getComplaintEmailTemplate(data);
    const text = getComplaintEmailText(data);

    await sendEmail({
      to: recipientEmail,
      subject: `[Finora] New Complaint/Feedback: ${data.subject}`,
      text,
      html,
    });

    console.log(`Complaint email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending complaint email:", error);
    throw new Error("Failed to submit complaint. Please try again later.");
  }
};

