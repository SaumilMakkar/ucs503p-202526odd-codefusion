import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import ReportSettingModel from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.models";
import mongoose from "mongoose";
import { generateReportService } from "../../services/report.service";
import ReportModel, { ReportStatusEnum } from "../../models/report.model";
import { calculateNextReportDate } from "../../utils/helper";
import { sendReportEmail, sendReportWhatsApp } from "../../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  //Today july 1, then run report for -> june 1 - 30 
//Get Last Month because this will run on the first of the month
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  // const from = "2025-04-01T23:00:00.000Z";
  // const to = "2025-04-T23:00:00.000Z";

  console.log("processReportJob started at:", now);
  console.log("Date range for report:", { from, to });

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    console.log("Running report job - looking for enabled report settings");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;
      if (!user) {
        console.log(`User not found for setting: ${setting._id}`);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);

        console.log(report, "resport data");

        let emailSent = false;
        let whatsappSent = false;
        
        if (report) {
          // Try to send via WhatsApp if user has phone number
          if (user.phoneNumber) {
            try {
              // Ensure phone number has + prefix for E.164 format
              const formattedPhone = user.phoneNumber.startsWith('+') ? user.phoneNumber : `+${user.phoneNumber}`;
              
              await sendReportWhatsApp({
                phoneNumber: `whatsapp:${formattedPhone}`,
                username: user.name!,
                report: {
                  period: report.period,
                  summary: {
                    income: report.summary.income,
                    expenses: report.summary.expenses,
                    balance: report.summary.balance,
                    savingsRate: report.summary.savingsRate,
                    topCategories: report.summary.topCategories.map((cat: any) => ({
                      category: cat.category,
                      name: cat.name,
                      amount: cat.amount,
                      percent: cat.percent,
                    })),
                  },
                  insights: report.insights,
                },
                frequency: setting.frequency!,
              });
              whatsappSent = true;
              console.log(`WhatsApp sent successfully for ${user.id}`);
            } catch (error) {
              console.log(`WhatsApp failed for ${user.id}:`, error);
              // Fallback to email if WhatsApp fails
            }
          }
          
          // Send email as fallback or if no phone number
          if (!whatsappSent && user.email) {
            try {
              await sendReportEmail({
                email: user.email!,
                username: user.name!,
                report: {
                  period: report.period,
                  summary: {
                    income: report.summary.income,
                    expenses: report.summary.expenses,
                    balance: report.summary.balance,
                    savingsRate: report.summary.savingsRate,
                    topCategories: report.summary.topCategories.map((cat: any) => ({
                      category: cat.category,
                      name: cat.name,
                      amount: cat.amount,
                      percent: cat.percent,
                    })),
                  },
                  insights: report.insights,
                },
                frequency: setting.frequency!,
              });
              emailSent = true;
              console.log(`Email sent successfully for ${user.id}`);
            } catch (error) {
              console.log(`Email failed for ${user.id}:`, error);
            }
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && (emailSent || whatsappSent)) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMMM d")}–${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error) {
        console.log(`Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅Processed: ${processedCount} report`);
    console.log(`❌ Failed: ${failedCount} report`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);
    return {
      success: false,
      error: "Report process failed",
    };
  }
};