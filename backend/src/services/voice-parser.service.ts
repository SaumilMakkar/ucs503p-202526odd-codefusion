import axios from "axios";
import { Env } from "../config/env.config";
import { PaymentMethodEnum } from "../models/transaction.model";
import { z } from "zod";

/**
 * Interface for parsed transaction data from voice input
 */
export interface ParsedVoiceTransaction {
  title?: string;
  amount?: number;
  type?: "INCOME" | "EXPENSE";
  category?: string;
  paymentMethod?: string;
  date?: string; // ISO date string
  description?: string;
}

/**
 * Schema for validating parsed transaction output
 */
const ParsedTransactionSchema = z.object({
  title: z.string().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  date: z.string().optional(), // ISO date string
  description: z.string().optional(),
});

/**
 * Available categories for transactions
 */
const AVAILABLE_CATEGORIES = [
  "groceries",
  "dining",
  "transportation",
  "utilities",
  "entertainment",
  "shopping",
  "healthcare",
  "travel",
  "housing",
  "income",
  "other",
];

/**
 * Available payment methods
 */
const AVAILABLE_PAYMENT_METHODS = Object.values(PaymentMethodEnum);

/**
 * Creates a prompt template for parsing voice transcript into transaction data
 */
const createVoiceParsingPrompt = (transcript: string): string => {
  // Get current date information for accurate date parsing
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  
  return `You are an intelligent financial assistant that extracts transaction details from natural language voice input.

CURRENT DATE CONTEXT (IMPORTANT - Use these exact dates):
- Today is: ${todayStr} (${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
- Yesterday was: ${yesterdayStr}
- Tomorrow will be: ${tomorrowStr}

User's voice transcript: "${transcript}"

Extract transaction details from this voice input and return ONLY a valid JSON object (not an array) with the following structure:
{
  "title": "string (optional)",           // Merchant/store name or brief transaction description
  "amount": number (optional),            // Transaction amount (positive number only)
  "type": "INCOME" or "EXPENSE" (optional), // Transaction type
  "category": "string (optional)",        // Must be one of: ${AVAILABLE_CATEGORIES.join(", ")}
  "paymentMethod": "string (optional)",   // Must be one of: ${AVAILABLE_PAYMENT_METHODS.join(", ")}
  "date": "ISO date string (optional)",   // Date in YYYY-MM-DD format (use today if not specified)
  "description": "string (optional)"      // Additional notes or description
}

IMPORTANT: Return ONLY a JSON object, NOT an array. The response must start with { and end with }.

**Important Rules:**
1. **Amount**: Extract numeric values. If currency is mentioned (rupees, dollars, ₹, $), extract the number. Remove any currency symbols.
2. **Type**: Determine if it's INCOME (earned, received, salary, payment received) or EXPENSE (spent, paid, bought, purchase).
3. **Category**: Map to one of the available categories. Common mappings:
   - Groceries/food/supermarket → "groceries"
   - Restaurant/cafe/dining/meal → "dining"
   - Taxi/uber/cab/transport/fuel → "transportation"
   - Electricity/water/phone/internet/bill → "utilities"
   - Movie/cinema/streaming/entertainment → "entertainment"
   - Shopping/mall/store/clothes → "shopping"
   - Medicine/pharmacy/doctor/hospital → "healthcare"
   - Hotel/flight/travel/trip → "travel"
   - Rent/housing/apartment → "housing"
   - Salary/income/payment received → "income"
4. **Payment Method**: CRITICAL - Always extract payment method if mentioned. Map to one of: ${AVAILABLE_PAYMENT_METHODS.join(", ")}
   - Card/credit card/debit card/credit/debit/visa/mastercard/plastic/through card/with card/paid by card/using card → "CARD"
   - Cash/money/notes/physical cash/paid cash/in cash/with cash → "CASH"
   - Bank transfer/UPI/NEFT/IMPS/transfer/via bank/through bank → "BANK_TRANSFER"
   - Google Pay/PhonePe/Paytm/mobile payment/UPI payment/GPay/through UPI/via UPI → "MOBILE_PAYMENT"
   - Auto debit/recurring/automatic/standing order/direct debit/auto payment → "AUTO_DEBIT"
   - If payment method is mentioned but doesn't match above, try to map to closest match
   - Common phrases: "spent through credit card" → "CARD", "paid by cash" → "CASH", "via Google Pay" → "MOBILE_PAYMENT"
5. **Date**: Use the CURRENT DATE CONTEXT provided above
   - "today" → ${todayStr} (use this exact date)
   - "yesterday" → ${yesterdayStr} (use this exact date)
   - "tomorrow" → ${tomorrowStr} (use this exact date)
   - If no date mentioned, use ${todayStr} (today's date)
   - NEVER use dates from 2023 or any past year unless explicitly stated
6. **Title**: CRITICAL - Always extract a title if possible. This is the most important field. Extract merchant name, store name, or transaction description. Look for:
   - Text after "at [place]" or "from [place]" (e.g., "at Walmart" → title: "Walmart")
   - Text after "on [item]" when it's a merchant (e.g., "on groceries at Target" → title: "Target")
   - Transaction type descriptions (e.g., "taxi fare" → title: "Taxi Fare", "electricity bill" → title: "Electricity Bill")
   - If no specific merchant, use a descriptive title based on category and context
   - Default to a meaningful description if merchant not found (e.g., "Groceries", "Restaurant Meal", "Transportation")
7. Only include fields that you can confidently extract. Omit uncertain fields. BUT always try to extract a title.

**Examples:**

Input: "Spent 500 rupees on groceries at Walmart today, paid by card"
Output: {
  "title": "Walmart",
  "amount": 500,
  "type": "EXPENSE",
  "category": "groceries",
  "paymentMethod": "CARD",
  "date": "${todayStr}"
}

Input: "Received 5000 rupees income from salary yesterday via bank transfer"
Output: {
  "title": "Salary",
  "amount": 5000,
  "type": "INCOME",
  "category": "income",
  "paymentMethod": "BANK_TRANSFER",
  "date": "${yesterdayStr}"
}

Input: "Paid 200 rupees for taxi fare"
Output: {
  "title": "Taxi Fare",
  "amount": 200,
  "type": "EXPENSE",
  "category": "transportation",
  "date": "${todayStr}"
}

Input: "Spent 1000 rupees on dinner at restaurant today, paid by Google Pay"
Output: {
  "title": "Restaurant",
  "amount": 1000,
  "type": "EXPENSE",
  "category": "dining",
  "paymentMethod": "MOBILE_PAYMENT",
  "date": "${todayStr}"
}

Input: "I spent 500 rupees through credit card"
Output: {
  "title": "Transaction",
  "amount": 500,
  "type": "EXPENSE",
  "paymentMethod": "CARD",
  "date": "${todayStr}"
}

Input: "Paid 2000 rupees by credit card for groceries"
Output: {
  "title": "Groceries",
  "amount": 2000,
  "type": "EXPENSE",
  "category": "groceries",
  "paymentMethod": "CARD",
  "date": "${todayStr}"
}

Now parse this transcript: "${transcript}"

Return ONLY a valid JSON object (starting with { and ending with }), no markdown, no code blocks, no explanations, no arrays.`;
};

/**
 * Parses voice transcript using OpenRouter API
 * Uses Gemini or another model through OpenRouter for intelligent parsing
 * This approach uses OpenRouter's OpenAI-compatible API endpoint
 */
export const parseVoiceTranscriptService = async (
  transcript: string
): Promise<ParsedVoiceTransaction> => {
  try {
    // Validate input
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("Transcript is required");
    }

    // Check if OpenRouter API key is configured
    if (!Env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Create the prompt for the AI model
    const systemPrompt = "You are a financial assistant that extracts transaction details from voice transcripts. Always return valid JSON object only (not an array), no markdown, no code blocks.";
    const userPrompt = createVoiceParsingPrompt(transcript);

    // Call OpenRouter API (OpenAI-compatible endpoint)
    // Using openai/gpt-4o-mini (reliable and available on OpenRouter)
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // Using OpenAI GPT-4o Mini through OpenRouter
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent parsing
        response_format: { type: "json_object" }, // Force JSON response
      },
      {
        headers: {
          "Authorization": `Bearer ${Env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://expense-tracker-app.com", // Optional: for tracking
          "X-Title": "Expense Tracker Voice Parser", // Optional: for tracking
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the response content
    const responseContent = response.data?.choices?.[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response content from OpenRouter API");
    }

    // Parse JSON response (remove markdown code blocks if present)
    let jsonString = responseContent.trim();
    jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Parse JSON and handle both object and array responses
    let jsonResult = JSON.parse(jsonString);
    
    // If the response is an array, take the first element
    if (Array.isArray(jsonResult)) {
      if (jsonResult.length > 0) {
        jsonResult = jsonResult[0];
      } else {
        jsonResult = {};
      }
    }
    
    // Ensure it's an object
    if (typeof jsonResult !== 'object' || jsonResult === null || Array.isArray(jsonResult)) {
      throw new Error("Invalid response format: expected JSON object");
    }

    // Validate and parse the result using Zod schema
    const parsed = ParsedTransactionSchema.parse(jsonResult);

    // Convert date string to proper format if present
    let dateString = parsed.date;
    if (!dateString) {
      // Default to today if no date specified
      dateString = new Date().toISOString().split("T")[0];
    } else {
      // Handle relative dates (today, yesterday, tomorrow) if AI didn't convert them
      const lowerDate = dateString.toLowerCase().trim();
      const today = new Date();
      
      if (lowerDate === 'today' || lowerDate.includes('today')) {
        dateString = today.toISOString().split("T")[0];
      } else if (lowerDate === 'yesterday' || lowerDate.includes('yesterday')) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateString = yesterday.toISOString().split("T")[0];
      } else if (lowerDate === 'tomorrow' || lowerDate.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateString = tomorrow.toISOString().split("T")[0];
      } else {
        // Parse the date string
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          // Invalid date, use today
          dateString = today.toISOString().split("T")[0];
        } else {
          // Ensure it's a valid date and not from 2023 or earlier (unless explicitly stated)
          const currentYear = today.getFullYear();
          if (date.getFullYear() < currentYear - 1) {
            // If date is from 2023 or earlier, assume it's a mistake and use today
            console.warn(`Date ${dateString} seems incorrect (year ${date.getFullYear()}), using today instead`);
            dateString = today.toISOString().split("T")[0];
          } else {
            dateString = date.toISOString().split("T")[0];
          }
        }
      }
    }

    // Return parsed transaction with proper date format
    // Only include properties that are defined (not undefined) to satisfy exactOptionalPropertyTypes
    const result: ParsedVoiceTransaction = {};
    
    if (parsed.title !== undefined) {
      result.title = parsed.title;
    }
    if (parsed.amount !== undefined) {
      result.amount = parsed.amount;
    }
    if (parsed.type !== undefined) {
      result.type = parsed.type;
    }
    if (parsed.category !== undefined) {
      result.category = parsed.category.toLowerCase();
    }
    if (parsed.paymentMethod !== undefined) {
      result.paymentMethod = parsed.paymentMethod;
    }
    if (dateString !== undefined) {
      result.date = dateString;
    }
    if (parsed.description !== undefined) {
      result.description = parsed.description;
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing voice transcript:", error);
    
    // If it's a validation error, throw with more context
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid parsing result: ${error.errors.map(e => e.message).join(", ")}`);
    }
    
    // If it's an axios error, extract more details
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }
    
    // Re-throw with context
    throw new Error(
      `Failed to parse voice transcript: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

