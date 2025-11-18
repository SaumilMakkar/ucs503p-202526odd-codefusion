# Voice Input Feature Guide

## Overview

The AI Expense Tracker now includes voice input functionality that allows users to add transactions by speaking naturally. The system uses the Web Speech API to convert speech to text and intelligent NLP parsing to extract transaction details.

## How It Works

### 1. Voice Recognition
- Uses the browser's built-in Web Speech API (Chrome, Edge, Safari)
- Supports continuous speech recognition
- Automatically starts listening when the button is clicked

### 2. Speech-to-Text Parsing
The system intelligently extracts transaction details from natural language using pattern matching:

**Supported Patterns:**
- **Amount**: "₹500", "500 rupees", "$50", "50 dollars"
- **Type**: "income", "expense", "earn", "spend", "bought", "paid"
- **Category**: grocery, dining, transportation, utilities, entertainment, shopping, healthcare, travel, housing, income, investments
- **Payment Method**: card, cash, bank transfer, mobile payment (Google Pay, PhonePe, Paytm), auto debit
- **Date**: "today", "yesterday", "tomorrow"
- **Merchant**: Text before keywords like "at", "from", "in", "to"

### 3. Form Auto-Fill
Once parsing is complete, the form is automatically populated with extracted details.

## Usage Examples

### Example 1: Simple Expense
**Voice Input**: "Spent 500 rupees on groceries at Walmart today, paid by card"

**Extracted:**
- Amount: 500
- Type: EXPENSE
- Category: groceries
- Merchant: Walmart
- Date: Today
- Payment Method: CARD

### Example 2: Income Transaction
**Voice Input**: "Received 5000 rupees income from salary yesterday via bank transfer"

**Extracted:**
- Amount: 5000
- Type: INCOME
- Category: income
- Date: Yesterday
- Payment Method: BANK_TRANSFER
- Description: from salary

### Example 3: Transportation Expense
**Voice Input**: "Paid 200 rupees for taxi fare today"

**Extracted:**
- Amount: 200
- Type: EXPENSE
- Category: transportation
- Date: Today

### Example 4: Dining Out
**Voice Input**: "Spent 800 rupees at restaurant for dinner, paid by cash"

**Extracted:**
- Amount: 800
- Type: EXPENSE
- Category: dining
- Date: Today
- Payment Method: CASH

### Example 5: Utilities
**Voice Input**: "Electricity bill 1500 rupees, auto debit"

**Extracted:**
- Amount: 1500
- Type: EXPENSE
- Category: utilities
- Payment Method: AUTO_DEBIT
- Merchant: Electricity

## Browser Support

✅ **Supported:**
- Google Chrome
- Microsoft Edge
- Safari (macOS/iOS)
- Opera

❌ **Not Supported:**
- Firefox (no Web Speech API support)
- Older browsers without Web Speech API

## Features

### ✨ Smart Parsing
- Automatically detects and extracts all transaction fields
- Handles various currencies (₹, $, rupees, dollars)
- Recognizes natural language patterns
- Cleans up common prefixes and noise words

### 🎯 Category Detection
The system recognizes keywords for 11 different categories:
- **Groceries**: grocery, food, supermarket
- **Dining**: restaurant, cafe, coffee, lunch, dinner
- **Transportation**: taxi, uber, petrol, fuel, bus
- **Utilities**: electricity, water, phone, internet
- **Entertainment**: movie, cinema, streaming, games
- **Shopping**: shopping, mall, clothes, shoes
- **Healthcare**: medicine, pharmacy, doctor
- **Travel**: hotel, flight, vacation, trip
- **Housing**: rent, mortgage, apartment
- **Income**: salary, income, freelance
- **Investments**: stocks, mutual fund, savings

### 💳 Payment Method Detection
Recognizes 5 payment methods:
- **Card**: credit card, debit card, visa, mastercard
- **Cash**: cash, money
- **Bank Transfer**: UPI, NEFT, IMPS, bank transfer
- **Mobile Payment**: Google Pay, PhonePe, Paytm, MobiKwik
- **Auto Debit**: auto debit, standing order, direct debit

## User Interface

### Voice Input Button
Located above the transaction form fields:
- **Mic Icon**: Click to start recording
- **Stop Icon**: Click to stop recording
- **Visual Feedback**: Shows "Listening..." status
- **Transcript Display**: Shows what was heard
- **Example Text**: Displays helpful example

### Error Handling
- Microphone not found
- Permission denied
- No speech detected
- Parsing errors with helpful messages

## Technical Details

### Files Created/Modified

1. **`client/src/hooks/use-voice-input.ts`**
   - Custom React hook for Web Speech API
   - Manages recording state and transcript
   - Handles errors and cleanup

2. **`client/src/utils/voice-parser.ts`**
   - NLP parsing logic
   - Extracts transaction details from text
   - Maps values to form-compatible formats

3. **`client/src/components/transaction/transaction-form.tsx`**
   - Integrated voice input button
   - Auto-fills form with parsed data
   - Shows visual feedback during recording

4. **`client/src/vite-env.d.ts`**
   - TypeScript declarations for Web Speech API

### Dependencies
No additional npm packages required - uses browser-native Web Speech API

## Best Practices

### For Users:
1. **Speak Clearly**: Enunciate words for better recognition
2. **Include Key Details**: Mention amount, category, and merchant
3. **Review Before Saving**: Always check auto-filled details
4. **Browser Compatibility**: Use Chrome or Edge for best results

### For Developers:
1. **Error Handling**: Always check browser support before using
2. **Permission Management**: Request microphone access gracefully
3. **User Feedback**: Show clear visual indicators during recording
4. **Fallback**: Provide manual input as alternative

## Future Enhancements

Potential improvements:
1. **Backend AI Parsing**: Use Google AI (already integrated) for better NLP
2. **Multi-language Support**: Support for different languages
3. **Contextual Learning**: Learn from user corrections
4. **Voice Commands**: Navigate UI using voice
5. **Offline Support**: Fallback parsing without internet

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Use Chrome or Edge
- Ensure microphone is connected
- Restart browser if needed

### Poor Recognition
- Speak clearly and at normal pace
- Reduce background noise
- Check internet connection (for some browsers)
- Try different phrasing

### Incorrect Parsing
- Be more specific in description
- Use exact category names
- Manually correct details if needed
- Provide feedback for improvement

## Example Transcripts

Here are more examples of what works well:

- "Uber ride ₹250 cash today"
- "Phone bill ₹600 UPI yesterday"
- "Salary ₹50000 bank transfer today"
- "Movie tickets ₹800 card entertainment"
- "Groceries at Reliance ₹1200 card today"
- "Starbucks coffee ₹350 cash"
- "Rent payment ₹15000 auto debit housing"
- "Google Pay transfer ₹2000 phonepe"
- "Fuel for car ₹2000 card petrol"
- "Doctor consultation ₹800 cash health"

## Security & Privacy

- All voice recognition happens in the browser
- No audio is sent to external servers
- Transcripts are processed client-side
- Standard browser permissions apply

---

**Note**: Voice input requires microphone access and works best with modern browsers (Chrome, Edge, Safari).

