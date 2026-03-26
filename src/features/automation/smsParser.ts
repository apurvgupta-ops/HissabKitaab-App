/**
 * HissabKitaab — SMS Transaction Parser (Scaffold)
 *
 * Regex-based parser for common Indian bank SMS formats.
 * This extracts merchant, amount, and transaction type from bank SMS messages.
 *
 * NOTE: This is a scaffold. The actual native SMS receiver
 * (BroadcastReceiver in Java/Kotlin) needs to be implemented
 * as a native module and bridged to React Native.
 */

export interface RawSmsMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
}

export interface ParsedTransaction {
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  merchant: string;
  accountSuffix: string;
  date: string;
  rawMessage: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'sms';
}

// Common Indian bank SMS sender patterns
const BANK_SENDERS = [
  /^[A-Z]{2}-[A-Z]+$/,           // e.g., AD-SBIBNK, VD-HDFCBK
  /^[A-Z]{6,}$/,                   // e.g., HDFCBK, ICICIB
  /SBI|HDFC|ICICI|AXIS|KOTAK|PNB|BOB|CANARA|YES|INDUS/i,
];

// Transaction patterns for Indian banks
const DEBIT_PATTERNS = [
  // SBI style: "Your A/c XX1234 debited by Rs.500.00 on 25-03-26"
  /(?:debited|spent|paid|deducted|withdrawn)\s*(?:by\s*)?(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
  // HDFC style: "Rs.1000.00 debited from HDFC Bank A/c **1234"
  /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:debited|sent|paid|transferred)/i,
  // UPI style: "UPI debit Rs.200 from A/c X1234"
  /(?:UPI|IMPS|NEFT)\s*(?:debit|Dr)\s*(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
];

const CREDIT_PATTERNS = [
  /(?:credited|received|deposited)\s*(?:with\s*)?(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
  /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:credited|received|deposited)/i,
  /(?:UPI|IMPS|NEFT)\s*(?:credit|Cr)\s*(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
];

// Account number patterns
const ACCOUNT_PATTERNS = [
  /(?:A\/?c|Acct?|Account)\s*(?:No\.?\s*)?(?:\*{2,}|[Xx]+)(\d{3,4})/i,
  /\*{2,}(\d{3,4})/,
  /[Xx]{4,}(\d{3,4})/,
];

// Merchant extraction patterns
const MERCHANT_PATTERNS = [
  /(?:at|to|from|@)\s+([A-Za-z0-9\s&'-]+?)(?:\s*(?:on|for|ref|UPI|Info|Txn))/i,
  /VPA\s+([a-zA-Z0-9@._-]+)/i,
  /Info:\s*(.+?)(?:\.|$)/i,
];

/**
 * Check if an SMS is from a known bank sender.
 */
export function isBankSms(sender: string): boolean {
  return BANK_SENDERS.some(pattern => pattern.test(sender));
}

/**
 * Parse a bank SMS message into a structured transaction.
 * Returns null if the message doesn't match any known pattern.
 */
export function parseBankSms(sms: RawSmsMessage): ParsedTransaction | null {
  const { body, sender, timestamp } = sms;

  // Skip non-bank SMS
  if (!isBankSms(sender)) {
    return null;
  }

  let type: 'debit' | 'credit' = 'debit';
  let amount = 0;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Try debit patterns first
  for (const pattern of DEBIT_PATTERNS) {
    const match = body.match(pattern);
    if (match?.[1]) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      type = 'debit';
      confidence = 'high';
      break;
    }
  }

  // Try credit patterns if no debit match
  if (amount === 0) {
    for (const pattern of CREDIT_PATTERNS) {
      const match = body.match(pattern);
      if (match?.[1]) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        type = 'credit';
        confidence = 'high';
        break;
      }
    }
  }

  if (amount === 0) {
    return null;
  }

  // Extract account suffix
  let accountSuffix = '****';
  for (const pattern of ACCOUNT_PATTERNS) {
    const match = body.match(pattern);
    if (match?.[1]) {
      accountSuffix = match[1];
      break;
    }
  }

  // Extract merchant
  let merchant = 'Unknown';
  for (const pattern of MERCHANT_PATTERNS) {
    const match = body.match(pattern);
    if (match?.[1]) {
      merchant = match[1].trim().substring(0, 50);
      break;
    }
  }

  return {
    type,
    amount,
    currency: 'INR',
    merchant,
    accountSuffix,
    date: new Date(timestamp).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    rawMessage: body,
    confidence,
    source: 'sms',
  };
}

/**
 * Batch-parse multiple SMS messages.
 * Filters out non-bank and unparseable messages.
 */
export function parseBankSmsBatch(messages: RawSmsMessage[]): ParsedTransaction[] {
  return messages
    .map(parseBankSms)
    .filter((tx): tx is ParsedTransaction => tx !== null);
}
