import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/types/api';

interface AccountFormProps {
  account?: Account;
  onSubmit: (account: Account) => void;
  onCancel?: () => void;
  accounts?: Account[];
}

export const AccountForm: React.FC<AccountFormProps> = ({ account, onSubmit, onCancel, accounts = [] }) => {
  const generateNextCode = () => {
    if (accounts.length === 0) return '1000';
    const codes = accounts.map(a => parseInt(a.accountCode)).filter(c => !isNaN(c));
    return codes.length > 0 ? (Math.max(...codes) + 1).toString() : '1000';
  };

  const [formData, setFormData] = useState({
    code: account?.accountCode || generateNextCode(),
    name: account?.accountName || '',
    type: account?.accountType || 'Asset',
    description: account?.description || '',
    status: account?.status || 'Active',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.accountCode || '',
        name: account.accountName || '',
        type: account.accountType || 'Asset',
        description: account.description || '',
        status: account.status || 'Active',
      });
    } else {
      setFormData(prev => ({ ...prev, code: generateNextCode() }));
    }
  }, [account, accounts]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: account?.id || Date.now().toString(),
      accountCode: formData.code,
      accountName: formData.name,
      accountType: formData.type,
      description: formData.description,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Account Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., 1000"
            disabled={!account}
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Account Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Cash"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Account Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Account['accountType'] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Current Assets"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Account['status'] })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {account ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
};
