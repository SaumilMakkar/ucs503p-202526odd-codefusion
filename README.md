# AI Expense Tracker

An intelligent expense management system built with the MERN Stack that leverages AI to automate transaction tracking, receipt scanning, and financial reporting.

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://your-live-link-here.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/saumilmakkar/ucs503p-202526odd-codefusion)

**[View Live Demo](https://ucs503p-202526odd-codefusion.vercel.app/)**

### Tech Stack

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![AI](https://img.shields.io/badge/AI-OCR-orange?style=for-the-badge&logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
</div>

## Overview

The AI Expense Tracker simplifies personal and business finance management by eliminating manual data entry and providing actionable insights through advanced analytics. Users can upload receipts, track recurring expenses, and receive automated monthly reports—all powered by AI and modern web technologies.

## Key Features

- **Secure Authentication** - JWT-based email/password authentication with Google OAuth support
- **AI Receipt Scanning** - Upload receipts and automatically extract transaction details using Gemini AI (merchant, amount, date, category, payment method)
- **Voice-Enabled Transaction Entry** - Natural language voice input with AI-powered parsing via LangChain and OpenRouter API (GPT-4o-mini)
- **Smart Transaction Management** - Create, edit, delete transactions with automatic categorization into 11 categories
- **Advanced Analytics Dashboard** - Real-time financial overview with MongoDB aggregate pipelines, expense breakdown pie charts, and income/expense line charts
- **AI Chatbot Assistant** - Intelligent chatbot with access to user's real financial data (balance, income, expenses, transactions)
- **Recurring Transactions** - Automated scheduled entries using cron jobs (Daily, Weekly, Monthly, Yearly)
- **Automated Monthly Reports** - AI-generated financial insights sent via email and WhatsApp
- **Complaint/Feedback System** - Submit complaints and feedback directly from the app
- **Flexible Filtering** - Filter transactions by date ranges (Last 30 Days, Last Month, Last 3 Months, Last Year, This Month, This Year, All Time)
- **CSV Import/Export** - Bulk transaction management (up to 300 transactions)
- **Payment Integration** - Razorpay integration for subscription management

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **State Management:** Redux Toolkit with RTK Query
- **UI Library:** Radix UI components with Tailwind CSS 4
- **Forms:** React Hook Form with Zod validation
- **Charts:** Recharts for data visualization
- **Routing:** React Router DOM
- **Voice:** Web Speech API (browser-native)

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (access + refresh tokens), Passport.js
- **AI Services:**
  - Google Gemini API for receipt scanning and report insights
  - LangChain for AI orchestration and voice transaction parsing
  - OpenRouter API (GPT-4o-mini) for voice transaction parsing and chatbot
- **File Storage:** Cloudinary
- **Email:** Resend API
- **Messaging:** Twilio WhatsApp API
- **Payment:** Razorpay integration
- **Automation:** Node-cron for scheduled jobs
- **Validation:** Zod schemas

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saumilmakkar/ucs503p-202526odd-codefusion.git
   cd ucs503p-202526odd-codefusion
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```

### Environment Variables

#### Backend (`.env` in `backend/` directory)

```env
# Server Configuration
NODE_ENV=development
PORT=8000
BASE_PATH=/api
FRONTEND_ORIGIN=http://localhost:5173

# Database
MONGODB_URL=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_MAILER_SENDER=noreply@yourdomain.com

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
```

#### Frontend (`.env` in `client/` directory)

```env
VITE_API_URL=http://localhost:8000/api
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:8000`

2. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/google` - Google OAuth authentication
- `POST /api/auth/logout` - User logout

### Transactions
- `POST /api/transaction/create` - Create new transaction
- `GET /api/transaction/all` - Get all transactions (with pagination and filters)
- `GET /api/transaction/:id` - Get single transaction
- `PUT /api/transaction/update/:id` - Update transaction
- `DELETE /api/transaction/delete/:id` - Delete transaction
- `POST /api/transaction/bulk-transaction` - Bulk import transactions
- `POST /api/transaction/bulk-delete` - Bulk delete transactions
- `POST /api/transaction/scan-receipt` - AI receipt scanning
- `POST /api/transaction/parse-voice` - Voice input parsing

### Analytics
- `GET /api/analytics/summary` - Financial overview summary
- `GET /api/analytics/chart` - Income/expense trend chart data
- `GET /api/analytics/expense-breakdown` - Category-wise expense breakdown

### Reports
- `GET /api/reports/all` - Get all user reports
- `POST /api/reports/generate` - Generate new report
- `PUT /api/reports/update-setting` - Update report settings
- `POST /api/reports/trigger-generation` - Manually trigger report generation

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI assistant (requires authentication)

### Complaint/Feedback
- `POST /api/complaint/submit` - Submit complaint or feedback (public endpoint)

### User Management
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/update` - Update user profile

### Billing
- `POST /api/billing/create-order` - Create Razorpay order
- `POST /api/billing/verify` - Verify payment

## Market Validation

Based on a survey of 48 respondents:
- **70.7%** rated expense tracking as critically important (5/5)
- **85.4%** want automatic receipt scanning and categorization
- **80.5%** find current tracking methods too time-consuming
- **75.6%** need financial reports and real-time analytics
- **4.17/5** average interest rating for an AI-powered expense tracker

## Recent Updates

### ✨ Latest Features

- **AI Chatbot with Real Data Access** - Chatbot now has access to user's actual financial data (balance, income, expenses, transactions) for personalized responses
- **Complaint/Feedback System** - Users can submit complaints and feedback directly from the app, with emails sent to admin
- **Enhanced Voice Input** - Improved voice parsing using OpenRouter API with better accuracy and natural language understanding
- **Improved Analytics** - Enhanced dashboard with better visualizations and date range filtering

## Documentation

- [Voice Input Guide](./docs/VOICE_INPUT_GUIDE.md)
- [Chatbot Implementation](./docs/CHATBOT_IMPLEMENTATION.md)
- [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)
- [Postman Testing Guide](./docs/POSTMAN_TESTING_GUIDE.md)

## Project Status

✅ **Completed Features:**
- Authentication & User Management
- AI Receipt Scanning
- Voice-Enabled Transaction Entry
- Smart Transaction Management
- Advanced Analytics Dashboard
- Recurring Transactions
- Automated Monthly Reports
- AI Chatbot Assistant
- Complaint/Feedback System
- CSV Import/Export
- Payment Integration

## Deployment

### Frontend
- **Platform:** Vercel
- **Live URL:** (https://ucs503p-202526odd-codefusion-zdge.vercel.app/)

### Backend
- **Platform:** Render/Cloud
- **Database:** MongoDB Atlas

### Environment Setup for Production
Make sure to set all environment variables in your deployment platform's environment settings.

## License

This project is developed as part of academic coursework.

---

**Built with ❤️**


