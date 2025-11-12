import { apiClient } from '../utils/apiClient';
import type { JournalEntry, JournalEntryCreate, JournalEntryUpdate } from '../types/journal';

export const mockJournalEntries: JournalEntry[] = [
  {
    id: '38',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-001-L01',
    description: 'Cash Sale of Services (Bank Account)',
    totalDebit: 5000,
    totalCredit: 5000,
    status: 'Posted',
    createdBy: '1',
    amount: 5000,
    accountCode: '1120',
    entries: [
      { id: '38-1', accountCode: '1120', accountName: 'Bank Account', debit: 5000, credit: 0, description: 'Cash Sale of Services' },
      { id: '38-2', accountCode: '4100', accountName: 'Service Revenue', debit: 0, credit: 5000, description: 'Service Revenue' },
    ],
  },
  {
    id: '39',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-001-L02',
    description: 'Cash Sale of Services (Service Revenue)',
    totalDebit: 5000,
    totalCredit: 5000,
    status: 'Posted',
    createdBy: '1',
    amount: 5000,
    accountCode: '4100',
    entries: [
      { id: '39-1', accountCode: '4100', accountName: 'Service Revenue', debit: 0, credit: 5000, description: 'Service Revenue' },
      { id: '39-2', accountCode: '1120', accountName: 'Bank Account', debit: 5000, credit: 0, description: 'Cash Sale of Services' },
    ],
  },
  {
    id: '40',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-002-L01',
    description: 'Office Supplies Purchase (Expense)',
    totalDebit: 750,
    totalCredit: 750,
    status: 'Posted',
    createdBy: '1',
    amount: 750,
    accountCode: '6100',
    entries: [
      { id: '40-1', accountCode: '6100', accountName: 'Office Supplies Expense', debit: 750, credit: 0, description: 'Office Supplies Purchase' },
      { id: '40-2', accountCode: '1120', accountName: 'Bank Account', debit: 0, credit: 750, description: 'Payment for office supplies' },
    ],
  },
  {
    id: '41',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-002-L02',
    description: 'Office Supplies Purchase (Bank Account)',
    totalDebit: 750,
    totalCredit: 750,
    status: 'Posted',
    createdBy: '1',
    amount: 750,
    accountCode: '1120',
    entries: [
      { id: '41-1', accountCode: '1120', accountName: 'Bank Account', debit: 0, credit: 750, description: 'Payment for office supplies' },
      { id: '41-2', accountCode: '6100', accountName: 'Office Supplies Expense', debit: 750, credit: 0, description: 'Office Supplies Purchase' },
    ],
  },
  {
    id: '42',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-003-L01',
    description: 'Payment of Accounts Payable (AP)',
    totalDebit: 2500,
    totalCredit: 2500,
    status: 'Posted',
    createdBy: '1',
    amount: 2500,
    accountCode: '2100',
    entries: [
      { id: '42-1', accountCode: '2100', accountName: 'Accounts Payable', debit: 2500, credit: 0, description: 'Payment of Accounts Payable' },
      { id: '42-2', accountCode: '1120', accountName: 'Bank Account', debit: 0, credit: 2500, description: 'Payment for AP' },
    ],
  },
  {
    id: '43',
    entryDate: '2025-07-28',
    reference: 'JE-20250728-003-L02',
    description: 'Payment of Accounts Payable (Bank Account)',
    totalDebit: 2500,
    totalCredit: 2500,
    status: 'Posted',
    createdBy: '1',
    amount: 2500,
    accountCode: '1120',
    entries: [
      { id: '43-1', accountCode: '1120', accountName: 'Bank Account', debit: 0, credit: 2500, description: 'Payment for AP' },
      { id: '43-2', accountCode: '2100', accountName: 'Accounts Payable', debit: 2500, credit: 0, description: 'Payment of Accounts Payable' },
    ],
  },
];


// Enhanced journal API service with mock data fallback
class EnhancedJournalApi {
  private isApiAvailable = true;
  private mockData = [...mockJournalEntries];
  private nextId = Math.max(...mockJournalEntries.map(e => Number.parseInt(e.id))) + 1;

  // Check if API is available
  private async checkApiHealth(): Promise<boolean> {
    try {
      await apiClient.get('/api/journal-entries');
      this.isApiAvailable = true;
      return true;
    } catch (error) {
      console.warn('API unavailable, using mock data:', error);
      this.isApiAvailable = false;
      return false;
    }
  }

  // Transform flat data into JournalEntry objects
  private transformFlatData(flatData: unknown[]): JournalEntry[] {
    const grouped: { [key: string]: unknown[] } = {};

    // Group by entryDate and base description (before '(')
    flatData.forEach(item => {
      if (typeof item === 'object' && item !== null && 'description' in item && 'entryDate' in item) {
        const baseDesc = (item.description as string).split(' (')[0];
        const key = `${item.entryDate}_${baseDesc}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      }
    });

    const entries: JournalEntry[] = [];
    let idCounter = 1;

    Object.values(grouped).forEach(group => {
      if (group.length >= 2) {
        const first = group[0] as { id: number; entryDate: string; description: string; amount: number; accountCode: string };
        const second = group[1] as { id: number; entryDate: string; description: string; amount: number; accountCode: string };
        const totalAmount = first.amount;

        const entry: JournalEntry = {
          id: idCounter.toString(),
          entryDate: first.entryDate.split('T')[0], // Remove time part
          reference: `JE-${first.entryDate.split('T')[0].replace(/-/g, '')}-${idCounter.toString().padStart(3, '0')}`,
          description: first.description.split(' (')[0],
          totalDebit: totalAmount,
          totalCredit: totalAmount,
          status: 'Posted',
          createdBy: '1',
          amount: totalAmount,
          accountCode: first.accountCode,
          entries: [
            {
              id: `${idCounter}-1`,
              accountCode: first.accountCode,
              accountName: first.accountCode, // Placeholder, could map to names
              debit: totalAmount,
              credit: 0,
              description: first.description
            },
            {
              id: `${idCounter}-2`,
              accountCode: second.accountCode,
              accountName: second.accountCode,
              debit: 0,
              credit: totalAmount,
              description: second.description
            }
          ]
        };
        entries.push(entry);
        idCounter++;
      }
    });

    return entries;
  }

  // Get all journal entries with fallback
  async getAll(): Promise<JournalEntry[]> {
    try {
      if (this.isApiAvailable) {
        const response = await apiClient.get('/api/journal-entries');
        // Ensure response is an array, fallback to mock if not
        if (Array.isArray(response)) {
          return this.transformFlatData(response);
        } else {
          console.warn('API response is not an array, using mock data');
          this.isApiAvailable = false;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch from API, using mock data:', error);
      this.isApiAvailable = false;
    }
    return [...this.mockData];
  }

  // Get journal entry by ID with fallback
  async getById(id: string): Promise<JournalEntry> {
    try {
      if (this.isApiAvailable) {
        const response = await apiClient.get(`/api/journal-entries/${id}`);
        return response;
      }
    } catch (error) {
      console.warn(`Failed to fetch entry ${id} from API, using mock data:`, error);
      this.isApiAvailable = false;
    }
    
    const entry = this.mockData.find(e => e.id === id);
    if (!entry) {
      throw new Error(`Journal entry with ID ${id} not found`);
    }
    return entry;
  }

  // Create new journal entry with fallback
  async create(entry: JournalEntryCreate): Promise<JournalEntry> {
    try {
      if (this.isApiAvailable) {
        const response = await apiClient.post('/api/journal-entries', entry);
        return response;
      }
    } catch (error) {
      console.warn('Failed to create entry via API, using mock data:', error);
      this.isApiAvailable = false;
    }

    // Create in mock data
    const newEntry: JournalEntry = {
      id: this.nextId.toString(),
      entryDate: entry.entryDate,
      reference: `JE-${Date.now()}`,
      description: entry.description || '',
      totalDebit: entry.amount,
      totalCredit: entry.amount,
      status: 'Draft',
      createdBy: '1',
      entries: [
        {
          id: `${this.nextId}-1`,
          accountCode: entry.accountCode,
          accountName: entry.accountCode,
          debit: entry.amount,
          credit: 0,
          description: entry.description || ''
        }
      ],
      amount: entry.amount,
      accountCode: entry.accountCode
    };
    
    this.mockData.push(newEntry);
    this.nextId++;
    return newEntry;
  }

  // Update journal entry with fallback
  async update(id: string, entry: JournalEntryUpdate): Promise<JournalEntry> {
    try {
      if (this.isApiAvailable) {
        const response = await apiClient.put(`/api/journal-entries/${id}`, entry);
        return response;
      }
    } catch (error) {
      console.warn('Failed to update entry via API, using mock data:', error);
      this.isApiAvailable = false;
    }

    // Update in mock data
    const index = this.mockData.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Journal entry with ID ${id} not found`);
    }
    
    this.mockData[index] = {
      ...this.mockData[index],
      ...entry,
      id: this.mockData[index].id // Preserve ID
    };
    
    return this.mockData[index];
  }

  // Delete journal entry with fallback
  async delete(id: string): Promise<void> {
    try {
      if (this.isApiAvailable) {
        await apiClient.delete(`/api/journal-entries/${id}`);
        return;
      }
    } catch (error) {
      console.warn('Failed to delete entry via API, using mock data:', error);
      this.isApiAvailable = false;
    }

    // Delete from mock data
    const index = this.mockData.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Journal entry with ID ${id} not found`);
    }
    
    this.mockData.splice(index, 1);
  }

  // Get mock data for testing
  getMockData(): JournalEntry[] {
    return [...this.mockData];
  }

  // Reset mock data
  resetMockData(): void {
    this.mockData = [...mockJournalEntries];
    this.nextId = Math.max(...mockJournalEntries.map(e => Number.parseInt(e.id))) + 1;
  }
}

// Export enhanced API service
export const enhancedJournalApi = new EnhancedJournalApi();

// Keep original exports for backward compatibility
export const journalApi = {
  getAll: () => enhancedJournalApi.getAll(),
  getById: (id: string) => enhancedJournalApi.getById(id),
  create: (entry: JournalEntryCreate) => enhancedJournalApi.create(entry),
  update: (id: string, entry: JournalEntryUpdate) => enhancedJournalApi.update(id, entry),
  delete: (id: string) => enhancedJournalApi.delete(id),
};


