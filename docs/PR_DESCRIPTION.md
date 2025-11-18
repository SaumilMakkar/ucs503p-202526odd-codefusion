# 🎤 Voice Input Enhancement: AI-Powered Transaction Parsing

## Overview

This PR enhances the voice input feature by migrating from client-side pattern matching to an AI-powered backend parsing service using **OpenRouter API** with GPT-4o-mini. This provides more accurate and flexible natural language understanding for voice transcripts.

## 🎯 What Changed

### Backend Changes

#### New Service: Voice Parser (`backend/src/services/voice-parser.service.ts`)
- **New service** that uses OpenRouter API to intelligently parse voice transcripts
- Uses **GPT-4o-mini** model through OpenRouter for reliable parsing
- Extracts transaction details: title, amount, type, category, payment method, date, and description
- Comprehensive prompt engineering with context-aware date handling
- Robust error handling and response validation using Zod schemas
- Handles edge cases like relative dates ("today", "yesterday", "tomorrow")

#### API Endpoint
- **New endpoint**: `POST /api/transaction/parse-voice`
- Accepts voice transcript and returns structured transaction data
- Validates input (max 5000 characters) using Zod schema

#### Configuration
- Added `OPENROUTER_API_KEY` environment variable support

### Frontend Changes

#### Transaction Form (`client/src/components/transaction/transaction-form.tsx`)
- **Migrated from client-side parsing to backend API**
- Added loading state for voice parsing (`isParsingVoice`)
- Improved error handling with user-friendly messages
- Prevents duplicate processing of the same transcript
- Better state management for voice input workflow

#### API Integration
- Added `parseVoiceInput` mutation endpoint in transaction API
- New `ParsedVoiceTransaction` type definition
- Proper TypeScript typing throughout

#### Voice Input Hook (`client/src/hooks/use-voice-input.ts`)
- Enhanced stop listening functionality
- Better handling of manual stops to prevent race conditions
- Improved state management

## 🚀 Key Features

### Intelligent Parsing Capabilities

The AI model can now understand:
- **Amounts**: Multiple currency formats ("500 rupees", "₹1000", "$50", "50 dollars")
- **Transaction Types**: Context-aware detection of INCOME vs EXPENSE
- **Categories**: Smart mapping to available categories (groceries, dining, transportation, etc.)
- **Payment Methods**: Recognizes various payment method phrasings (card, cash, UPI, bank transfer, etc.)
- **Dates**: Handles relative dates ("today", "yesterday", "tomorrow") and specific dates
- **Merchants**: Extracts store/merchant names from natural language
- **Descriptions**: Captures additional context and notes

### Example Parsing

**Input**: `"Spent 500 rupees on groceries at Walmart today, paid by card"`

**Output**:
```json
{
  "title": "Walmart",
  "amount": 500,
  "type": "EXPENSE",
  "category": "groceries",
  "paymentMethod": "CARD",
  "date": "2025-11-18"
}
```

## 📋 Setup Instructions

### 1. Get OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Create a new API key

### 2. Add Environment Variable
Add to `backend/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Restart Backend
```bash
cd backend
npm run dev
```

## 🔧 Technical Details

- **Model**: `openai/gpt-4o-mini` (via OpenRouter)
- **Temperature**: 0.3 (for consistent parsing)
- **Response Format**: JSON object (enforced)
- **Validation**: Zod schemas for both input and output
- **Error Handling**: Comprehensive error messages and fallbacks

## ✅ Benefits

1. **Better Accuracy**: AI understands context and variations in speech
2. **More Flexible**: Handles different phrasings and natural language better
3. **Smarter Parsing**: Understands relationships between words and context
4. **Centralized Logic**: All parsing logic in backend, easier to maintain
5. **Extensible**: Easy to improve by refining prompts or switching models

## 📝 Files Changed

- ✨ `backend/src/services/voice-parser.service.ts` (new)
- 📝 `backend/src/controllers/transaction.controller.ts`
- 📝 `backend/src/routes/transaction.route.ts`
- 📝 `backend/src/validators/transaction.validator.ts`
- 📝 `backend/src/config/env.config.ts`
- 📝 `client/src/components/transaction/transaction-form.tsx`
- 📝 `client/src/features/transaction/transactionAPI.ts`
- 📝 `client/src/features/transaction/transactionType.ts`
- 📝 `client/src/hooks/use-voice-input.ts`
- 📚 `VOICE_INPUT_OPENROUTER_IMPLEMENTATION.md` (documentation)

## 🧪 Testing

- [x] Voice input captures transcript correctly
- [x] Backend API parses various voice input formats
- [x] Form auto-fills with parsed data
- [x] Error handling works for invalid inputs
- [x] Loading states display correctly
- [x] Date parsing handles relative dates correctly

## 📚 Documentation

Comprehensive implementation guide added in `VOICE_INPUT_OPENROUTER_IMPLEMENTATION.md` covering:
- Setup instructions
- API endpoint documentation
- Example inputs and outputs
- Troubleshooting guide
- Future enhancements

---

**Note**: This implementation uses OpenRouter API directly. The commit message references LangChain, but the current implementation uses direct API calls to OpenRouter's OpenAI-compatible endpoint for simplicity and reliability.

