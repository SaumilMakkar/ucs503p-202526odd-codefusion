import axios from "axios";
import { Env } from "../config/env.config";
import { findByIdUserService } from "./user.service";
import { summaryAnalyticsService } from "./analytics.service";
import TransactionModel from "../models/transaction.model";
import { DateRangeEnum } from "../enums/data-range.enum";

/**
 * Comprehensive knowledge base about the AI Expense Tracker project
 */
const PROJECT_KNOWLEDGE_BASE = `
# AI Expense Tracker - Complete Project Information

## Project Overview
AI Expense Tracker is an intelligent expense management SaaS platform built with MERN Stack (MongoDB, Express.js, React, Node.js) that leverages AI to automate transaction tracking, receipt scanning, and financial reporting.

## Core Features

### 1. Authentication & User Management
- JWT-based secure authentication (email/password)
- Google OAuth integration
- User profile management
- Secure session management with refresh tokens

### 2. AI-Powered Receipt Scanning
- Upload receipt images (JPG, PNG)
- Automatic extraction of transaction details using Gemini AI
- Extracts: merchant name, amount, date, category, payment method
- Cloudinary integration for image storage
- Supports multiple receipt formats

### 3. Voice-Enabled Transaction Entry
- Web Speech API integration for voice input
- Natural language processing using OpenRouter API (GPT-4o-mini)
- Automatic parsing of: amount, type, category, payment method, date, merchant, description
- Real-time transcript display
- Supports phrases like "Spent 500 rupees on groceries at Walmart today, paid by card"

### 4. Smart Transaction Management
- Create, edit, delete transactions
- Automatic categorization into 11 categories:
  - Groceries, Dining, Transportation, Utilities, Entertainment
  - Shopping, Healthcare, Travel, Housing, Income, Investments
- 6 Payment methods: Card, Cash, Bank Transfer, Mobile Payment, Auto Debit, Other
- Transaction types: Income, Expense
- Bulk operations (import/export CSV up to 300 transactions)
- Advanced filtering by date range, type, category, keyword search

### 5. Advanced Analytics Dashboard
- Real-time financial overview
- Category-wise expense breakdown (pie charts)
- Income vs Expense trends (line charts)
- MongoDB aggregate pipelines for efficient data processing
- Date range filtering (Last 30 Days, Last Month, Last 3 Months, Last Year, This Month, This Year, All Time)
- Key metrics: Total Income, Total Expenses, Available Balance, Savings Rate

### 6. Recurring Transactions
- Set up recurring transactions with frequencies: Daily, Weekly, Monthly, Yearly
- Automated transaction creation using cron jobs
- Next occurrence calculation
- Automatic processing of recurring entries

### 7. Automated Monthly Reports
- AI-generated financial insights using Gemini
- Automated report generation via cron jobs
- WhatsApp integration (Twilio) for report delivery
- Personalized recommendations based on spending patterns
- Category-wise spending analysis
- Savings rate calculations

### 8. CSV Import/Export
- Bulk transaction import (up to 300 transactions)
- CSV export for data portability
- Column mapping interface
- Data validation and error handling
- Duplicate detection

## Technical Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens), Passport.js
- **AI Services**: 
  - Google Gemini API for receipt scanning and report insights
  - OpenRouter API (GPT-4o-mini) for voice transaction parsing
- **File Storage**: Cloudinary
- **Email**: Resend API
- **Messaging**: Twilio WhatsApp API
- **Payment**: Razorpay integration
- **Automation**: Node-cron for scheduled jobs
- **Validation**: Zod schemas

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Library**: Radix UI components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Voice**: Web Speech API (browser-native)
- **Styling**: Tailwind CSS 4

### Database Schema
- **Users**: email, password (bcrypt), name, profile
- **Transactions**: userId, title, amount, type, category, date, paymentMethod, description, isRecurring, recurringInterval, receiptUrl
- **Reports**: userId, period, insights, categories breakdown
- **Billing Orders**: subscription management

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/google - Google OAuth
- POST /api/auth/logout - Logout

### Transactions
- POST /api/transaction/create - Create transaction
- GET /api/transaction/all - Get all transactions (with pagination, filters)
- GET /api/transaction/:id - Get single transaction
- PUT /api/transaction/update/:id - Update transaction
- DELETE /api/transaction/delete/:id - Delete transaction
- POST /api/transaction/bulk-transaction - Bulk import
- POST /api/transaction/bulk-delete - Bulk delete
- POST /api/transaction/scan-receipt - AI receipt scanning
- POST /api/transaction/parse-voice - Voice input parsing

### Analytics
- GET /api/analytics/overview - Financial overview
- GET /api/analytics/expense-breakdown - Category breakdown
- GET /api/analytics/income-expense-trend - Income/expense trends

### Reports
- GET /api/reports - Get user reports
- POST /api/reports/generate - Generate report
- PUT /api/reports/settings - Update report settings

## Market Validation
Based on survey of 48 respondents:
- 70.7% rated expense tracking as critically important (5/5)
- 85.4% want automatic receipt scanning
- 80.5% find current methods too time-consuming
- 75.6% need financial reports and analytics
- 4.17/5 average interest rating

## Project Team
- Saumil Makkar
- Divyansh Sharma
- Dheeraj Kumar Bhaskar

## Course Information
- Course: UCS503P
- Academic Year: 2025-26 (Odd Semester)
- Team: CodeFusion

## Deployment
- Frontend: Vercel
- Backend: Render/Cloud
- Database: MongoDB Atlas
- Live Demo: https://ucs503p-202526odd-codefusion.vercel.app
`;

/**
 * Creates a system prompt for the chatbot with project knowledge and user data
 * @param userData - User's profile information (name, email)
 * @param analyticsData - User's financial analytics (balance, income, expenses)
 * @param recentTransactions - User's recent transactions
 */
const createChatbotSystemPrompt = (
  userData?: { name: string; email: string } | null,
  analyticsData?: any,
  recentTransactions?: any[]
): string => {
  // Format user data section
  let userDataSection = "";
  if (userData) {
    userDataSection = `
## Current User Information
- **Name**: ${userData.name}
- **Email**: ${userData.email}
`;
  }

  // Format analytics data section
  let analyticsSection = "";
  if (analyticsData) {
    const {
      totalIncome = 0,
      totalExpenses = 0,
      availableBalance = 0,
      transactionCount = 0,
      savingData = { savingsPercentage: 0, expenseRatio: 0 },
    } = analyticsData;

    const balanceStatus = availableBalance >= 0 ? "positive" : "negative (overdrawn)";
    const balanceEmoji = availableBalance >= 0 ? "✅" : "⚠️";

    analyticsSection = `
## User's Financial Overview (Last 30 Days)
${balanceEmoji} **Available Balance**: ₹${Math.abs(availableBalance).toFixed(2)} (${balanceStatus})
💰 **Total Income**: ₹${totalIncome.toFixed(2)}
💸 **Total Expenses**: ₹${totalExpenses.toFixed(2)}
📊 **Total Transactions**: ${transactionCount}
💾 **Savings Rate**: ${savingData.savingsPercentage?.toFixed(2) || 0}%
📈 **Expense Ratio**: ${savingData.expenseRatio?.toFixed(2) || 0}%
`;
  }

  // Format recent transactions section
  let transactionsSection = "";
  if (recentTransactions && recentTransactions.length > 0) {
    const transactionsList = recentTransactions
      .slice(0, 5) // Show only last 5 transactions
      .map(
        (txn, idx) =>
          `${idx + 1}. **${txn.title}** - ₹${Math.abs(txn.amount).toFixed(2)} (${txn.type}) - ${txn.category} - ${new Date(txn.date).toLocaleDateString()}`
      )
      .join("\n");

    transactionsSection = `
## Recent Transactions (Last 5)
${transactionsList}
`;
  }

  return `You are an intelligent AI assistant for the AI Expense Tracker SaaS platform. You are helpful, professional, and knowledgeable about all aspects of the application.

${PROJECT_KNOWLEDGE_BASE}

${userDataSection}

${analyticsSection}

${transactionsSection}

## Your Role
- Answer questions about the user's **actual financial data** using the information provided above
- When asked about balance, income, expenses, or transactions, use the **real data** shown above
- Answer questions about features, functionality, and how to use the application
- Provide technical information about the stack and architecture
- Help users understand how to perform actions in the app
- Offer tips and best practices for expense tracking based on their actual spending patterns
- Be concise but thorough in your responses
- Use a friendly, professional tone
- **IMPORTANT**: You have access to the user's real financial data. Always use actual numbers when answering questions about their finances.

## Response Guidelines
- **When asked about balance/income/expenses**: Use the exact numbers from the Financial Overview above
- **When asked about transactions**: Reference the Recent Transactions list above
- Keep responses clear and actionable
- Use bullet points for lists (with - or *)
- Provide step-by-step instructions when relevant
- Reference specific features by their exact names
- Be encouraging and supportive
- Format text properly:
  - Use **bold** for emphasis (will be rendered as bold)
  - Use *italic* for subtle emphasis (will be rendered as italic)
  - Use code formatting for technical terms or code snippets
  - Use numbered lists (1., 2., 3.) or bullet points (- or *)
  - Keep paragraphs short and readable
- Avoid excessive markdown - use it sparingly for clarity
- Write in a conversational, helpful tone

## Examples of Questions You Can Answer with Real Data:
- "What is my available balance?" → Use the Available Balance from Financial Overview
- "How much did I spend?" → Use Total Expenses from Financial Overview
- "What's my income?" → Use Total Income from Financial Overview
- "Show me my recent transactions" → List the Recent Transactions above
- "What categories am I spending on?" → Analyze the Recent Transactions

Remember: You are representing a professional SaaS product, so maintain high quality in all responses. Always use the user's actual data when available.`;
};

/**
 * Chatbot message interface
 */
export interface ChatbotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

/**
 * Chatbot service that uses OpenRouter API to provide intelligent responses
 * about the AI Expense Tracker project with access to user's real financial data
 * @param userMessage - The user's message/query
 * @param conversationHistory - Previous conversation messages for context
 * @param userId - The authenticated user's ID to fetch their data
 */
export const chatWithBotService = async (
  userMessage: string,
  conversationHistory: ChatbotMessage[] = [],
  userId?: string
): Promise<string> => {
  try {
    // Validate input
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error("Message is required");
    }

    // Check if OpenRouter API key is configured
    if (!Env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing from environment variables");
      throw new Error("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env file.");
    }

    // Fetch user data if userId is provided
    let userData: { name: string; email: string } | null = null;
    let analyticsData: any = null;
    let recentTransactions: any[] = [];

    if (userId) {
      try {
        // Fetch user profile
        const user = await findByIdUserService(userId);
        if (user) {
          userData = {
            name: user.name,
            email: user.email,
          };
        }

        // Fetch analytics data (Last 30 Days)
        analyticsData = await summaryAnalyticsService(
          userId,
          DateRangeEnum.LAST_30_DAYS
        );

        // Fetch recent transactions (last 5)
        recentTransactions = await TransactionModel.find({ userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("title amount type category date paymentMethod description")
          .lean();

        console.log("Chatbot: Fetched user data", {
          hasUser: !!userData,
          hasAnalytics: !!analyticsData,
          transactionCount: recentTransactions.length,
        });
      } catch (error) {
        // Log error but don't fail - chatbot can still work without data
        console.error("Error fetching user data for chatbot:", error);
      }
    }

    // Create system prompt with user data
    const systemPrompt = createChatbotSystemPrompt(userData, analyticsData, recentTransactions);

    // Build conversation messages
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage.trim(),
    });

    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // Using GPT-4o-mini for cost-effective responses
        messages: messages,
        temperature: 0.7, // Slightly creative for more natural responses
        max_tokens: 1000, // Limit response length
      },
      {
        headers: {
          Authorization: `Bearer ${Env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://expense-tracker-app.com",
          "X-Title": "AI Expense Tracker Chatbot",
          "Content-Type": "application/json",
        },
      }
    );

    // Extract response content
    const responseContent = response.data?.choices?.[0]?.message?.content;

    if (!responseContent) {
      console.error("Chatbot API response structure:", JSON.stringify(response.data, null, 2));
      throw new Error("No response content from chatbot API");
    }

    return responseContent.trim();
  } catch (error) {
    console.error("Error in chatbot service:", error);

    // If it's an axios error, extract more details
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const statusCode = error.response?.status;
      const errorMessage = errorData?.error?.message || errorData?.message || error.message;
      
      console.error("OpenRouter API Error Details:", {
        status: statusCode,
        statusText: error.response?.statusText,
        data: errorData,
        message: errorMessage,
      });

      // Provide more specific error messages
      if (statusCode === 401) {
        throw new Error("Chatbot API authentication failed. Please check API key configuration.");
      } else if (statusCode === 429) {
        throw new Error("Chatbot API rate limit exceeded. Please try again in a moment.");
      } else if (statusCode === 500) {
        throw new Error("Chatbot API server error. Please try again later.");
      } else {
        throw new Error(`Chatbot API error: ${errorMessage || `Status ${statusCode}`}`);
      }
    }

    // Re-throw with context
    throw new Error(
      `Failed to get chatbot response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

