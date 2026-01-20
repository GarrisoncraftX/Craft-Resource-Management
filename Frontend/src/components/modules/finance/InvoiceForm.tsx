import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChartOfAccount } from '@/types/javabackendapi/financeTypes';
import type { MappedAccountPayable, MappedAccountReceivable } from '@/services/javabackendapi/financeApi';

interface InvoiceFormProps {
  type: 'payable' | 'receivable';
  invoice?: MappedAccountPayable | MappedAccountReceivable;
  onSubmit: (invoice: MappedAccountPayable | MappedAccountReceivable) => void;
  onCancel: () => void;
  accounts: ChartOfAccount[];
  generateInvoiceNumber: () => Promise<string>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ type, invoice, onSubmit, onCancel, accounts, generateInvoiceNumber }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    customer: type === 'receivable' ? (invoice as MappedAccountReceivable)?.customer || '' : '',
    vendor: type === 'payable' ? (invoice as MappedAccountPayable)?.vendor || '' : '',
    amount: invoice?.amount || 0,
    dueDate: invoice?.dueDate || '',
    description: invoice?.description || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    paymentTerms: type === 'receivable' ? (invoice as MappedAccountReceivable)?.paymentTerms || 'Net 30' : (invoice as MappedAccountPayable)?.paymentTerms || 'Net 30',
    category: type === 'payable' ? (invoice as MappedAccountPayable)?.category || '' : '',
    arAccountCode: type === 'receivable' ? (invoice as MappedAccountReceivable)?.arAccountCode || '' : '',
    revenueAccountCode: type === 'receivable' ? (invoice as MappedAccountReceivable)?.revenueAccountCode || '' : '',
    apAccountCode: type === 'payable' ? (invoice as MappedAccountPayable)?.apAccountCode || '' : '',
    expenseAccountCode: type === 'payable' ? (invoice as MappedAccountPayable)?.expenseAccountCode || '' : '',
  });
  const [isGeneratingInvoiceNumber, setIsGeneratingInvoiceNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assetAccounts = accounts.filter(acc => acc.accountType.toLowerCase() === 'asset');
  const revenueAccounts = accounts.filter(acc => acc.accountType.toLowerCase() === 'revenue');
  const liabilityAccounts = accounts.filter(acc => acc.accountType.toLowerCase() === 'liability');
  const expenseAccounts = accounts.filter(acc => acc.accountType.toLowerCase() === 'expense');

  useEffect(() => {
    if (!invoice && !formData.invoiceNumber) {
      handleGenerateInvoiceNumber();
    }
  }, []);

  const handleGenerateInvoiceNumber = async () => {
    try {
      setIsGeneratingInvoiceNumber(true);
      const invoiceNumber = await generateInvoiceNumber();
      setFormData(prev => ({ ...prev, invoiceNumber }));
    } catch (error) {
      console.error('Failed to generate invoice number:', error);
      const prefix = type === 'payable' ? 'AP' : 'AR';
      const fallbackNumber = `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      setFormData(prev => ({ ...prev, invoiceNumber: fallbackNumber }));
    } finally {
      setIsGeneratingInvoiceNumber(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const baseData = {
      id: invoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      amount: formData.amount,
      dueDate: formData.dueDate,
      description: formData.description,
      issueDate: formData.issueDate,
    };

    if (type === 'receivable') {
      await onSubmit({
        ...baseData,
        customer: formData.customer,
        status: 'Draft',
        amountPaid: 0,
        balance: formData.amount,
        paymentTerms: formData.paymentTerms,
        arAccountCode: formData.arAccountCode,
        revenueAccountCode: formData.revenueAccountCode,
      });
    } else {
      await onSubmit({
        ...baseData,
        vendor: formData.vendor,
        status: 'Pending',
        category: formData.category,
        paymentTerms: formData.paymentTerms,
        apAccountCode: formData.apAccountCode,
        expenseAccountCode: formData.expenseAccountCode,
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <div className="flex gap-2">
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Auto-generated..."
              disabled={isGeneratingInvoiceNumber}
              className="font-mono"
            />
            {!invoice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateInvoiceNumber}
                disabled={isGeneratingInvoiceNumber}
              >
                {isGeneratingInvoiceNumber ? 'Generating...' : 'Regenerate'}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {invoice ? 'Invoice number cannot be changed' : 'Auto-generated invoice number'}
          </p>
        </div>
        <div>
          <Label htmlFor={type === 'receivable' ? 'customer' : 'vendor'}>
            {type === 'receivable' ? 'Customer' : 'Vendor'}
          </Label>
          <Input
            id={type === 'receivable' ? 'customer' : 'vendor'}
            value={type === 'receivable' ? formData.customer : formData.vendor}
            onChange={(e) => setFormData({ ...formData, [type === 'receivable' ? 'customer' : 'vendor']: e.target.value })}
            placeholder={type === 'receivable' ? 'Customer name' : 'Vendor name'}
            required
          />
        </div>
      </div>

      {type === 'receivable' && (
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Services or products description"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        {type === 'payable' ? (
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Office Expenses">Office Expenses</SelectItem>
                <SelectItem value="IT Services">IT Services</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Professional Services">Professional Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>

      {type === 'payable' && (
        <div>
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Net 15">Net 15</SelectItem>
              <SelectItem value="Net 30">Net 30</SelectItem>
              <SelectItem value="Net 45">Net 45</SelectItem>
              <SelectItem value="Net 60">Net 60</SelectItem>
              <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {type === 'receivable' ? (
          <>
            <div>
              <Label htmlFor="arAccountCode">AR Account (Asset)</Label>
              <Select value={formData.arAccountCode} onValueChange={(value) => setFormData({ ...formData, arAccountCode: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select AR account" />
                </SelectTrigger>
                <SelectContent>
                  {assetAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.accountCode}>
                      {acc.accountCode} - {acc.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="revenueAccountCode">Revenue Account</Label>
              <Select value={formData.revenueAccountCode} onValueChange={(value) => setFormData({ ...formData, revenueAccountCode: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue account" />
                </SelectTrigger>
                <SelectContent>
                  {revenueAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.accountCode}>
                      {acc.accountCode} - {acc.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="apAccountCode">AP Account (Liability)</Label>
              <Select value={formData.apAccountCode} onValueChange={(value) => setFormData({ ...formData, apAccountCode: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select AP account" />
                </SelectTrigger>
                <SelectContent>
                  {liabilityAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.accountCode}>
                      {acc.accountCode} - {acc.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expenseAccountCode">Expense Account</Label>
              <Select value={formData.expenseAccountCode} onValueChange={(value) => setFormData({ ...formData, expenseAccountCode: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select expense account" />
                </SelectTrigger>
                <SelectContent>
                  {expenseAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.accountCode}>
                      {acc.accountCode} - {acc.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {type === 'payable' && (
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Invoice description"
            required
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="w-full max-w-xs" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : type === 'receivable' ? 'Create Invoice' : 'Add Invoice'}
        </Button>
      </div>
    </form>
  );
};
