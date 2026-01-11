import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Receipt, Calendar, DollarSign, Send } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { financeApiService, AccountReceivable } from '@/services/javabackendapi/financeApi';
import { mockCustomerInvoices } from '@/services/mockData/mockData';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Partial';
  description: string;
  issueDate: string;
  amountPaid: number;
  balance: number;
  paymentTerms: string;
}

export const AccountsReceivable: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [isPaymentDialog, setIsPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await financeApiService.getAllAccountReceivables();
      const mappedData: CustomerInvoice[] = data.map((item: AccountReceivable) => ({
        id: item.id?.toString() || '',
        invoiceNumber: item.invoiceNumber,
        customer: item.customerId?.toString() || 'Unknown',
        amount: item.amount,
        dueDate: item.dueDate,
        status: item.status as CustomerInvoice['status'],
        description: item.description || '',
        issueDate: item.dueDate,
        amountPaid: 0,
        balance: item.amount,
        paymentTerms: 'Net 30',
      }));
      setInvoices(mappedData);
    } catch (error) {
      console.error('Failed to fetch invoices, using mock data:', error);
      setInvoices(mockCustomerInvoices);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'outline';
      case 'Sent': return 'secondary';
      case 'Paid': return 'default';
      case 'Partial': return 'default';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const InvoiceForm: React.FC<{ invoice?: CustomerInvoice; onSubmit: (invoice: CustomerInvoice) => void }> = ({ invoice, onSubmit }) => {
    const [formData, setFormData] = useState({
      invoiceNumber: invoice?.invoiceNumber || '',
      customer: invoice?.customer || '',
      amount: invoice?.amount || 0,
      dueDate: invoice?.dueDate || '',
      description: invoice?.description || '',
      issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
      paymentTerms: invoice?.paymentTerms || 'Net 30',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        id: invoice?.id || Date.now().toString(),
        ...formData,
        status: 'Draft',
        amountPaid: 0,
        balance: formData.amount,
      });
      setIsAddingInvoice(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="INV-2024-001"
              required
            />
          </div>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input
              id="customer"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="Customer name"
              required
            />
          </div>
        </div>

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

        <Button type="submit" className="w-full">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </form>
    );
  };

  const PaymentDialog: React.FC = () => {
    const handlePayment = () => {
      if (selectedInvoice && paymentAmount > 0) {
        const updatedInvoices = invoices.map(inv => {
          if (inv.id === selectedInvoice.id) {
            const newAmountPaid = inv.amountPaid + paymentAmount;
            const newBalance = inv.amount - newAmountPaid;
            return {
              ...inv,
              amountPaid: newAmountPaid,
              balance: newBalance,
              status: (newBalance === 0 ? 'Paid' : 'Partial') as CustomerInvoice['status']
            };
          }
          return inv;
        });
        setInvoices(updatedInvoices);
        setIsPaymentDialog(false);
        setPaymentAmount(0);
      }
    };

    return (
      <Dialog open={isPaymentDialog} onOpenChange={setIsPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Invoice Amount: ${selectedInvoice?.amount.toLocaleString()}</Label>
            </div>
            <div>
              <Label>Amount Paid: ${selectedInvoice?.amountPaid.toLocaleString()}</Label>
            </div>
            <div>
              <Label>Balance: ${selectedInvoice?.balance.toLocaleString()}</Label>
            </div>
            <div>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                max={selectedInvoice?.balance}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePayment} disabled={paymentAmount <= 0 || paymentAmount > (selectedInvoice?.balance || 0)}>
                Record Payment
              </Button>
              <Button variant="outline" onClick={() => setIsPaymentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.balance, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Accounts Receivable</h2>
          <p className="text-muted-foreground">Manage customer invoices and payments</p>
        </div>
        <PermissionGuard requiredPermissions={['finance.receivable.create']}>
          <Dialog open={isAddingInvoice} onOpenChange={setIsAddingInvoice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new customer invoice
                </DialogDescription>
              </DialogHeader>
              <InvoiceForm onSubmit={(invoice) => setInvoices([...invoices, invoice])} />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.balance > 0).length} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'Overdue').length} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.amountPaid > 0).length} payments received
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Invoices</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by invoice number, customer, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} of {invoices.length} invoices displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${invoice.amountPaid.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${invoice.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                        View
                      </Button>
                      <PermissionGuard requiredPermissions={['finance.receivable.send']}>
                        <Button variant="outline" size="sm" disabled={invoice.status !== 'Draft'}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard requiredPermissions={['finance.receivable.payment']}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={invoice.balance === 0}
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsPaymentDialog(true);
                          }}
                        >
                          Payment
                        </Button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentDialog />
    </div>
  );
};