# Voice Input with OpenRouter API - Implementation Summary

## Overview

The voice input feature has been upgraded to use **OpenRouter API** with **Gemini model** for intelligent parsing of voice transcripts. This replaces the previous client-side pattern matching with AI-powered natural language understanding.

## What Was Implemented

### Backend Changes

1. **Environment Configuration** (`backend/src/config/env.config.ts`)
   - Added `OPENROUTER_API_KEY` environment variable

2. **Voice Parser Service** (`backend/src/services/voice-parser.service.ts`)
   - New service that uses OpenRouter API to parse voice transcripts
   - Uses Gemini 2.0 Flash model through OpenRouter
   - Intelligently extracts: title, amount, type, category, payment method, date, and description
   - Includes comprehensive prompt engineering for accurate parsing

3. **Controller** (`backend/src/controllers/transaction.controller.ts`)
   - Added `parseVoiceInputController` endpoint handler

4. **Route** (`backend/src/routes/transaction.route.ts`)
   - Added `POST /transaction/parse-voice` endpoint

5. **Validator** (`backend/src/validators/transaction.validator.ts`)
   - Added `voiceInputSchema` for validating voice input requests

### Frontend Changes

1. **Transaction API** (`client/src/features/transaction/transactionAPI.ts`)
   - Added `parseVoiceInput` mutation endpoint
   - Exported `useParseVoiceInputMutation` hook

2. **Transaction Types** (`client/src/features/transaction/transactionType.ts`)
   - Added `ParsedVoiceTransaction` interface

3. **Transaction Form** (`client/src/components/transaction/transaction-form.tsx`)
   - Updated to use backend API for voice parsing instead of client-side parsing
   - Added loading state for voice parsing
   - Improved error handling

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to your API keys section
4. Create a new API key
5. Copy the API key

### 2. Add to Environment Variables

Add the following to your `.env` file in the `backend` directory:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Restart Backend Server

After adding the environment variable, restart your backend server:

```bash
cd backend
npm run dev
```

## How It Works

1. **User speaks** into the microphone using the Web Speech API (browser-native)
2. **Transcript is captured** on the client side
3. **Transcript is sent** to the backend API endpoint `/transaction/parse-voice`
4. **Backend calls OpenRouter API** with Gemini model to intelligently parse the transcript
5. **Parsed data is returned** to the frontend
6. **Form is auto-filled** with extracted transaction details

## API Endpoint

### POST `/api/transaction/parse-voice`

**Request Body:**
```json
{
  "transcript": "Spent 500 rupees on groceries at Walmart today, paid by card"
}
```

**Response:**
```json
{
  "message": "Voice input parsed successfully",
  "data": {
    "title": "Walmart",
    "amount": 500,
    "type": "EXPENSE",
    "category": "groceries",
    "paymentMethod": "CARD",
    "date": "2025-01-15",
    "description": ""
  }
}
```

## Features

### Intelligent Parsing

The AI model can understand:
- **Amounts**: "500 rupees", "₹1000", "$50", "50 dollars"
- **Transaction Types**: Income (earned, received, salary) or Expense (spent, paid, bought)
- **Categories**: Automatically maps to available categories (groceries, dining, transportation, etc.)
- **Payment Methods**: Card, cash, bank transfer, mobile payment, auto debit
- **Dates**: "today", "yesterday", "tomorrow", or specific dates
- **Merchants**: Extracts store/merchant names from context
- **Descriptions**: Additional notes or context

### Error Handling

- Validates transcript length (max 5000 characters)
- Handles API errors gracefully
- Provides user-friendly error messages
- Falls back gracefully if parsing fails

## Example Voice Inputs

✅ **"Spent 500 rupees on groceries at Walmart today, paid by card"**
- Extracts: amount=500, type=EXPENSE, category=groceries, title=Walmart, paymentMethod=CARD, date=today

✅ **"Received 5000 rupees income from salary yesterday via bank transfer"**
- Extracts: amount=5000, type=INCOME, category=income, paymentMethod=BANK_TRANSFER, date=yesterday

✅ **"Paid 200 rupees for taxi fare"**
- Extracts: amount=200, type=EXPENSE, category=transportation, title=Taxi Fare

## Technical Details

### Model Used
- **Model**: `google/gemini-2.0-flash-exp` (via OpenRouter)
- **Temperature**: 0.3 (for consistent parsing)
- **Response Format**: JSON object

### Prompt Engineering
The service uses a carefully crafted prompt that:
- Provides clear instructions to the AI
- Includes examples of expected outputs
- Maps natural language to structured data
- Handles edge cases and variations

## Benefits Over Previous Implementation

1. **Better Accuracy**: AI understands context and variations in speech
2. **More Flexible**: Handles different phrasings and languages better
3. **Smarter Parsing**: Understands relationships between words
4. **Extensible**: Easy to improve by refining prompts
5. **Centralized**: All parsing logic in one place (backend)

## Troubleshooting

### "OpenRouter API key is not configured"
- Make sure `OPENROUTER_API_KEY` is set in your `.env` file
- Restart the backend server after adding the key

### "Failed to parse voice transcript"
- Check your OpenRouter API key is valid
- Verify you have credits/balance in your OpenRouter account
- Check backend logs for detailed error messages

### Poor parsing results
- Try speaking more clearly
- Include more details (amount, category, merchant)
- Check if the transcript is being captured correctly

## Future Enhancements

- Support for multiple languages
- Real-time parsing as user speaks
- Learning from user corrections
- Support for audio file uploads
- Integration with other voice models

