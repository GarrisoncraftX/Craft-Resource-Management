import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { financeApiService } from '@/services/javabackendapi/financeApi';
import type { ChartOfAccount } from '@/types/javabackendapi/financeTypes';
import type { JournalEntry, JournalEntryLine } from '@/types/journalTypes';

interface JournalEntryFormProps {
  entry?: JournalEntry;
  onSubmit: (entry: JournalEntry) => void | Promise<void>;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ entry, onSubmit }) => {
  const {user } = useAuth();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [formData, setFormData] = useState({
    entryDate: entry?.entryDate || new Date().toISOString().split('T')[0],
    reference: entry?.reference || '',
    description: entry?.description || '',
    entries: entry?.entries || [{ id: '1', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }] as JournalEntryLine[],
  });

  useEffect(() => {
    financeApiService.getAllChartOfAccounts().then(setAccounts).catch(console.error);
  }, []);

  const addEntryLine = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { id: Date.now().toString(), accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }],
    });
  };

  const updateEntryLine = (index: number, field: string, value: string | number) => {
    const updatedEntries = formData.entries.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        if (field === 'accountCode') {
          const account = accounts.find(a => a.accountCode === value);
          if (account) updated.accountName = account.accountName;
        }
        return updated;
      }
      return item;
    });
    setFormData({ ...formData, entries: updatedEntries });
  };

  const removeEntryLine = (index: number) => {
    setFormData({
      ...formData,
      entries: formData.entries.filter((_, i) => i !== index),
    });
  };

  const totalDebit = formData.entries.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = formData.entries.reduce((sum, item) => sum + item.credit, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDebit !== totalCredit) {
      alert('Total debits must equal total credits!');
      return;
    }

    onSubmit({
      id: entry?.id || Date.now().toString(),
      ...formData,
      totalDebit,
      totalCredit,
      status: 'Draft',
      createdBy: String(user?.id || ''),
      amount: totalDebit,
      accountCode: formData.entries[0]?.accountCode || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter journal entry description"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Journal Entry Lines</Label>
          <Button type="button" variant="outline" onClick={addEntryLine}>
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>

        {formData.entries.map((lineItem, index) => (
          <Card key={lineItem.id} className="p-4">
            <div className="grid grid-cols-6 gap-4 items-end">
              <div className="col-span-2">
                <Label>Account</Label>
                <Select value={lineItem.accountCode} onValueChange={(v) => updateEntryLine(index, 'accountCode', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.accountCode} value={acc.accountCode}>
                        {acc.accountCode} - {acc.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Debit</Label>
                <Input
                  type="number"
                  value={lineItem.debit}
                  onChange={(e) => updateEntryLine(index, 'debit', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Credit</Label>
                <Input
                  type="number"
                  value={lineItem.credit}
                  onChange={(e) => updateEntryLine(index, 'credit', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={lineItem.description}
                  onChange={(e) => updateEntryLine(index, 'description', e.target.value)}
                  placeholder="Line description"
                />
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEntryLine(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <span className="font-medium">Total Debits: ${totalDebit.toFixed(2)}</span>
            <span className="ml-4 font-medium">Total Credits: ${totalCredit.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className={`font-medium ${totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}`}>
              {totalDebit === totalCredit ? 'Balanced' : 'Out of Balance'}
            </span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={totalDebit !== totalCredit}>
        {entry ? 'Update Entry' : 'Create Journal Entry'}
      </Button>
    </form>
  );
};
