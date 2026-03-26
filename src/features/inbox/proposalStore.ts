/**
 * HissabKitaab — Local proposal store (in-memory + AsyncStorage persistence)
 * Since there's no backend endpoint for proposals yet, this is local-first.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@hissabkitaab/proposals';

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export interface TransactionProposal {
  id: string;
  source: 'sms' | 'notification' | 'receipt';
  sourceIcon: string;
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
  status: ProposalStatus;
  rawData?: string;
  createdAt: number;
  updatedAt: number;
}

let proposals: TransactionProposal[] = [];
let listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  } catch {
    // Silently fail — not critical
  }
}

/**
 * Load proposals from AsyncStorage.
 */
export async function loadProposals(): Promise<TransactionProposal[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      proposals = JSON.parse(raw);
    }
  } catch {
    proposals = [];
  }
  return proposals;
}

/**
 * Get all proposals (from memory).
 */
export function getProposals(): TransactionProposal[] {
  return [...proposals];
}

/**
 * Get pending proposals.
 */
export function getPendingProposals(): TransactionProposal[] {
  return proposals.filter(p => p.status === 'pending');
}

/**
 * Add a new proposal.
 */
export async function addProposal(
  proposal: Omit<TransactionProposal, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
): Promise<TransactionProposal> {
  const now = Date.now();
  const newProposal: TransactionProposal = {
    ...proposal,
    id: `prop_${now}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  proposals = [newProposal, ...proposals];
  await persist();
  notifyListeners();
  return newProposal;
}

/**
 * Approve a proposal.
 */
export async function approveProposal(id: string): Promise<void> {
  proposals = proposals.map(p =>
    p.id === id ? { ...p, status: 'approved' as const, updatedAt: Date.now() } : p,
  );
  await persist();
  notifyListeners();
}

/**
 * Reject a proposal.
 */
export async function rejectProposal(id: string): Promise<void> {
  proposals = proposals.map(p =>
    p.id === id ? { ...p, status: 'rejected' as const, updatedAt: Date.now() } : p,
  );
  await persist();
  notifyListeners();
}

/**
 * Edit a proposal (updates fields and marks as 'edited').
 */
export async function editProposal(
  id: string,
  updates: Partial<Pick<TransactionProposal, 'merchant' | 'amount' | 'category' | 'notes'>>,
): Promise<void> {
  proposals = proposals.map(p =>
    p.id === id
      ? { ...p, ...updates, status: 'edited' as const, updatedAt: Date.now() }
      : p,
  );
  await persist();
  notifyListeners();
}

/**
 * Subscribe to proposal changes.
 */
export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Seed mock proposals for development/testing.
 */
export async function seedMockProposals(): Promise<void> {
  if (proposals.length > 0) {return;}

  const mocks: Array<Omit<TransactionProposal, 'id' | 'status' | 'createdAt' | 'updatedAt'>> = [
    {
      source: 'sms',
      sourceIcon: 'sms',
      merchant: 'Swiggy',
      amount: 459.0,
      currency: 'INR',
      category: 'Food & Drink',
      date: new Date().toISOString().split('T')[0],
      notes: 'UPI debit via HDFC Bank',
      confidence: 'high',
      rawData: 'Rs.459.00 debited from HDFC Bank A/c **4521 for Swiggy',
    },
    {
      source: 'notification',
      sourceIcon: 'notifications',
      merchant: 'Amazon Pay',
      amount: 1299.0,
      currency: 'INR',
      category: 'Shopping',
      date: new Date().toISOString().split('T')[0],
      notes: 'Payment via Google Pay notification',
      confidence: 'medium',
    },
    {
      source: 'sms',
      sourceIcon: 'sms',
      merchant: 'Uber',
      amount: 245.5,
      currency: 'INR',
      category: 'Transportation',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      notes: 'UPI debit via SBI',
      confidence: 'high',
      rawData: 'Your A/c XX1234 debited by Rs.245.50 for Uber',
    },
    {
      source: 'notification',
      sourceIcon: 'notifications',
      merchant: 'Netflix',
      amount: 649.0,
      currency: 'INR',
      category: 'Entertainment',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      notes: 'Subscription renewal',
      confidence: 'high',
    },
    {
      source: 'sms',
      sourceIcon: 'sms',
      merchant: 'BigBasket',
      amount: 832.0,
      currency: 'INR',
      category: 'Shopping',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
      notes: 'ICICI Bank debit',
      confidence: 'medium',
      rawData: 'Rs.832.00 debited from ICICI Bank XXXX3456 to BigBasket',
    },
  ];

  for (const mock of mocks) {
    await addProposal(mock);
  }
}
