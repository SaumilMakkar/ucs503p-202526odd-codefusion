import { CATEGORIES, PAYMENT_METHODS, _TRANSACTION_TYPE } from '@/constant';

export interface ParsedTransaction {
  title?: string;
  amount?: string;
  type?: string;
  category?: string;
  paymentMethod?: string;
  date?: Date;
  description?: string;
}

/**
 * Parses voice input to extract transaction details
 * This uses pattern matching and keyword detection
 */
export function parseVoiceTransaction(text: string): ParsedTransaction {
  const result: ParsedTransaction = {};
  const lowerText = text.toLowerCase();
  
  console.log('🔍 Voice Parser Debug:');
  console.log('  Input text:', text);
  console.log('  Lowercase text:', lowerText);

  // Extract transaction type (income/expense)
  if (lowerText.includes('income') || lowerText.includes('earn') || lowerText.includes('salary') || lowerText.includes('paid me')) {
    result.type = _TRANSACTION_TYPE.INCOME;
  } else if (lowerText.includes('expense') || lowerText.includes('spend') || lowerText.includes('bought') || lowerText.includes('paid')) {
    result.type = _TRANSACTION_TYPE.EXPENSE;
  }

  // Extract amount - look for currency patterns
  const amountRegex = /(?:₹|rs|rupees?|dollars?|inr|\$|\b)(\s*)?(\d+(?:[.,]\d+)?)/gi;
  const amountMatch = text.match(amountRegex);
  if (amountMatch) {
    // Extract the numeric part
    const numericPart = amountMatch[0].replace(/[₹rs\s,rupees?dollars?inr$]/gi, '');
    result.amount = numericPart.replace(',', '.');
  }

  // Extract category from known categories
  const categoryKeywords = {
    groceries: ['grocery', 'food', 'grocery store', 'supermarket'],
    dining: ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'meal', 'burger', 'pizza'],
    transportation: ['taxi', 'uber', 'petrol', 'fuel', 'gas', 'bus', 'metro', 'train', 'cab'],
    utilities: ['electricity', 'water', 'phone', 'internet', 'wifi', 'utility', 'bill'],
    entertainment: ['movie', 'cinema', 'streaming', 'netflix', 'music', 'games', 'entertainment'],
    shopping: ['shopping', 'mall', 'store', 'clothes', 'shoes', 'online shopping'],
    healthcare: ['medicine', 'pharmacy', 'doctor', 'hospital', 'medical', 'health'],
    travel: ['hotel', 'flight', 'ticket', 'vacation', 'travel', 'trip'],
    housing: ['rent', 'mortgage', 'house', 'apartment', 'room'],
    income: ['salary', 'income', 'payment', 'freelance', 'job'],
    investments: ['investment', 'stocks', 'mutual fund', 'savings'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.category = category;
      break;
    }
  }

  // Extract payment method - improved detection with "by" context
  const paymentKeywords: Record<string, string[]> = {
    CARD: ['paid by card', 'with card', 'credit card', 'debit card', 'card', 'visa', 'mastercard', 'amex', 'diners'],
    CASH: ['paid by cash', 'with cash', 'cash', 'money', 'physical cash', 'notes', 'coins'],
    BANK_TRANSFER: ['by bank transfer', 'bank transfer', 'transfer', 'upi', 'neft', 'imps', 'rtgs', 'swift'],
    MOBILE_PAYMENT: ['by google pay', 'by phonepe', 'by paytm', 'google pay', 'phonepe', 'paytm', 'mobikwik', 'mobile payment', 'tez', 'bhims'],
    AUTO_DEBIT: ['by auto debit', 'auto debit', 'auto', 'standing order', 'direct debit', 'recurring'],
  };

  // Check for payment methods (prioritize longer phrases first)
  // Sort entries by the length of the longest keyword in each category
  const sortedMethods = Object.entries(paymentKeywords).sort((a, b) => {
    const maxLenA = Math.max(...a[1].map(k => k.length));
    const maxLenB = Math.max(...b[1].map(k => k.length));
    return maxLenB - maxLenA;
  });

  console.log('  Checking payment methods with sorted order...');
  for (const [method, keywords] of sortedMethods) {
    const foundKeyword = keywords.find(keyword => lowerText.includes(keyword));
    if (foundKeyword) {
      console.log(`  ✅ Found payment method: ${method} (matched: "${foundKeyword}")`);
      result.paymentMethod = method;
      break;
    } else {
      console.log(`  ❌ ${method}: no match`);
    }
  }
  console.log('  Final payment method:', result.paymentMethod);
  console.log('  Final parsed result:', result);

  // Extract date information
  const today = new Date();
  const datePatterns = [
    { pattern: /today|now/i, offset: 0 },
    { pattern: /yesterday/i, offset: -1 },
    { pattern: /tomorrow/i, offset: 1 },
  ];

  for (const { pattern, offset } of datePatterns) {
    if (pattern.test(text)) {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      result.date = date;
      break;
    }
  }

  // Extract merchant/title (words before keywords)
  const titleIndicators = ['at', 'from', 'in', 'to', 'bought', 'spent', 'paid', 'store', 'shop', 'merchant'];
  for (const indicator of titleIndicators) {
    const index = lowerText.indexOf(indicator);
    if (index > 0) {
      const potentialTitle = text.substring(0, index).trim();
      // Clean up common prefixes
      const cleanedTitle = potentialTitle
        .replace(/^(spent|bought|paid|expense|income|earn|received)\s+/i, '')
        .trim();
      if (cleanedTitle.length > 0 && cleanedTitle.length < 50) {
        result.title = cleanedTitle;
        break;
      }
    }
  }

  // If no title extracted, try to get meaningful text before amount or category
  if (!result.title) {
    const amountIndex = amountMatch ? text.toLowerCase().indexOf(amountMatch[0].toLowerCase()) : -1;
    if (amountIndex > 0) {
      const potentialTitle = text.substring(0, amountIndex).trim();
      // Clean up common prefixes
      const cleanedTitle = potentialTitle
        .replace(/^(spent|bought|paid|expense|income|earn|received|₹|rs|rupees|dollars)\s*/i, '')
        .trim();
      if (cleanedTitle.length > 0 && cleanedTitle.length < 50) {
        result.title = cleanedTitle;
      }
    }
  }

  // Use remaining text as description if available
  const descriptionKeyPhrases = ['for', 'note', 'memo', 'about'];
  for (const phrase of descriptionKeyPhrases) {
    const index = lowerText.indexOf(phrase);
    if (index > -1) {
      result.description = text.substring(index + phrase.length).trim();
      break;
    }
  }

  return result;
}

/**
 * Maps parsed category to the exact value expected by the form
 */
export function mapCategoryToFormValue(category: string): string {
  const categoryMap: Record<string, string> = {};
  CATEGORIES.forEach(cat => {
    categoryMap[cat.value.toLowerCase()] = cat.value;
  });
  return categoryMap[category.toLowerCase()] || category;
}

/**
 * Maps parsed payment method to the exact value expected by the form
 */
export function mapPaymentMethodToFormValue(method: string): string {
  const methodMap: Record<string, string> = {};
  PAYMENT_METHODS.forEach(m => {
    methodMap[m.value.toLowerCase()] = m.value;
  });
  const mapped = methodMap[method.toLowerCase()] || method;
  console.log(`  Mapping "${method}" to:`, mapped);
  return mapped;
}

