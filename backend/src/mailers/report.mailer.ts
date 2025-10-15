import { formatCurrency } from "../utils/format-currency";
import { getReportEmailTemplate } from "./templates/report.template";
import { sendEmail, sendWhatsAppMessage } from "./mailer";
import { ReportType } from "../@types/report.type";

type ReportEmailParams = {
  email: string;
  username: string;
  report: ReportType;
  frequency: string;
};

type ReportWhatsAppParams = {
  phoneNumber: string; // User's WhatsApp number in format: whatsapp:+1234567890
  username: string;
  report: ReportType;
  frequency: string;
};

export async function sendReportEmail(params: ReportEmailParams): Promise<any> {
  const { email, username, report, frequency } = params;
  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency
  );

  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrency(report.summary.income)}
    Expenses: ${formatCurrency(report.summary.expenses)}
    Balance: ${formatCurrency(report.summary.balance)}
    Savings Rate: ${report.summary.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

  console.log(text, "text mail");

  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
}

export async function sendReportWhatsApp(params: ReportWhatsAppParams): Promise<any> {
  const { phoneNumber, username, report, frequency } = params;
  
  // Format the message for WhatsApp with emojis and formatting
  const message = `
🔔 *${frequency} Financial Report*
Period: ${report.period}

👤 Hi ${username}!

📊 *Summary*
💰 Income: ${formatCurrency(report.summary.income)}
💸 Expenses: ${formatCurrency(report.summary.expenses)}
💵 Balance: ${formatCurrency(report.summary.balance)}
📈 Savings Rate: ${report.summary.savingsRate.toFixed(2)}%

🔝 *Top Spending Categories:*
${report.summary.topCategories.map((cat, idx) => 
  `${idx + 1}. ${cat.name}: ${formatCurrency(cat.amount)}`
).join('\n')}

💡 *Insights:*
${report.insights.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n')}

---
Finora - Your Finance Tracker 📱
`.trim();

  console.log(message, "WhatsApp message");

  return sendWhatsAppMessage({
    to: phoneNumber,
    message,
  });
};