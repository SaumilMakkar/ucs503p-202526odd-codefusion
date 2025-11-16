# AI Expense Tracker

An intelligent expense management system built with the MERN Stack that leverages AI to automate transaction tracking, receipt scanning, and financial reporting.

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://your-live-link-here.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/dheerajkrbhaskar/ucs503p-202526odd-codefusion)

**[View Live Demo](https://ucs503p-202526odd-codefusion.vercel.app/)**

### Tech Stack

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![AI](https://img.shields.io/badge/AI-OCR-orange?style=for-the-badge&logo=openai&logoColor=white)
</div>

## Overview

The AI Expense Tracker simplifies personal and business finance management by eliminating manual data entry and providing actionable insights through advanced analytics. Users can upload receipts, track recurring expenses, and receive automated monthly reports—all powered by AI and modern web technologies.

## Key Features

- **Secure Authentication** - JWT-based email and password authentication
- **AI Receipt Scanning** - Upload receipts and automatically extract transaction details (merchant, amount, date)
- **Smart Transaction Management** - Create, edit, and delete transactions with automatic categorization
- **Advanced Analytics** - MongoDB aggregate pipelines powering expense breakdown pie charts and income/expense line charts
- **Recurring Transactions** - Automated scheduled entries using cron jobs
- **Monthly Reports** - Auto-generated financial summaries sent to users via whatsapp
- **Voice Assistant**-Creation of transactions via voice assistant
- **Flexible Filtering** - Filter transactions by date ranges (Last 30 Days, custom periods)
- **CSV Import/Export** - Bulk transaction management

## Tech Stack

**Frontend:** React.js  
**Backend:** Node.js + Express.js  
**Database:** MongoDB  
**AI/OCR:** Cloud-based Vision API  
**Authentication:** JWT  
**Automation:** Cron Jobs

## Google OAuth

Google Sign-In is supported in addition to email/password.

Backend env (set in your deployment environment or `.env`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (e.g. `http://localhost:8000/api/auth/google/callback`)
- `FRONTEND_ORIGIN` (e.g. `http://localhost:5173`)

Client env:

- `VITE_API_URL` (e.g. `http://localhost:8000/api`)

Setup:

1) Install backend dep in `backend`:
   - `npm install passport-google-oauth20`
2) In Google Cloud Console, create OAuth credentials and add an authorized redirect URI matching `GOOGLE_CALLBACK_URL`.
3) Start backend and client. From the sign-in page, click "Continue with Google" to authenticate.

## Market Validation

Based on a survey of 48 respondents:
- **70.7%** rated expense tracking as critically important (5/5)
- **85.4%** want automatic receipt scanning and categorization
- **80.5%** find current tracking methods too time-consuming
- **75.6%** need financial reports and real-time analytics
- **4.17/5** average interest rating for an AI-powered expense tracker

## Project Timeline

**Estimated Duration:** 3-4 months
1. Authentication & Transaction CRUD - 2-3 weeks
2. AI Receipt Scanning Integration - 3-4 weeks
3. Advanced Analytics Dashboard - 3-4 weeks
4. Recurring Transactions & Reports - 3-4 weeks
5. Testing & Deployment - 1-2 weeks

## Contributors

1. Saumil Makkar
2. Divyansh Sharma
3. Dheeraj Kumar Bhaskar

## Course Information

**Course:** UCS503P  
**Academic Year:** 2025-26 (Odd Semester)  
**Team:** CodeFusion


