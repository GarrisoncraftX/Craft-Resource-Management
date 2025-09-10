import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface JournalLineItem {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalEntry {
  id: string;
  entryDate: string;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: 'Draft' | 'Posted' | 'Approved';
  createdBy: string;
  entries: JournalLineItem[];
  amount: number;
  accountCode: string;
}

interface JournalEntryFormProps {
  entry?: JournalEntry;
  onSubmit: (entry: JournalEntry) => void | Promise<void>;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ entry, onSubmit }) => {
  const {user } = useAuth();
  const [formData, setFormData] = useState({
    entryDate: entry?.entryDate || new Date().toISOString().split('T')[0],
    reference: entry?.reference || '',
    description: entry?.description || '',
    entries: entry?.entries || [{ id: '1', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }],
  });

  const addEntryLine = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { id: Date.now().toString(), accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }],
    });
  };

  const updateEntryLine = (index: number, field: string, value: string | number) => {
    const updatedEntries = formData.entries.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
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
      createdBy: user?.firstName + user?.lastName || 'Current User',
      amount: totalDebit,
      accountCode: formData.entries[0]?.accountCode || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="e.g., JE-001"
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
              <div>
                <Label>Account Code</Label>
                <Input
                  value={lineItem.accountCode}
                  onChange={(e) => updateEntryLine(index, 'accountCode', e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input
                  value={lineItem.accountName}
                  onChange={(e) => updateEntryLine(index, 'accountName', e.target.value)}
                  placeholder="Cash"
                  required
                />
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
