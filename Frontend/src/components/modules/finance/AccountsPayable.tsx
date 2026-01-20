import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { ChartOfAccount } from '@/types/javabackendapi/financeTypes';
import { mockInvoice } from '@/services/mockData/mockData';
import { fetchAccountPayables, generateAccountPayableInvoiceNumber, fetchAccounts, financeApiService, type MappedAccountPayable } from '@/services/javabackendapi/financeApi';
import { useToast } from '@/hooks/use-toast';
import { InvoiceForm } from './InvoiceForm';



export const AccountsPayable: React.FC = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<MappedAccountPayable[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<MappedAccountPayable | null>(null);
  const [isViewDialog, setIsViewDialog] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchAccountsData();
  }, []);

  const fetchAccountsData = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast({ title: 'Error', description: 'Failed to fetch accounts', variant: 'destructive' });
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchAccountPayables();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices, using mock data:', error);
      setInvoices(mockInvoice);
      toast({ title: 'Error', description: 'Failed to fetch invoices', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'outline';
      case 'Approved': return 'secondary';
      case 'Paid': return 'default';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const handleAddInvoice = async (invoice: MappedAccountPayable) => {
    try {
      await financeApiService.createAccountPayable({
        invoiceNumber: invoice.invoiceNumber,
        vendorName: invoice.vendor,
        amount: invoice.amount,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        description: invoice.description,
        category: invoice.category,
        paymentTerms: invoice.paymentTerms,
        apAccountCode: invoice.apAccountCode,
        expenseAccountCode: invoice.expenseAccountCode,
      });
      toast({ title: 'Success', description: 'Invoice created successfully' });
      await fetchInvoices();
      setIsAddingInvoice(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast({ title: 'Error', description: 'Failed to create invoice', variant: 'destructive' });
    }
  };

  const handleCancelAddInvoice = () => {
    setIsAddingInvoice(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await financeApiService.updateAccountPayableStatus(Number(id), 'Approved');
      toast({ title: 'Success', description: 'Invoice approved successfully' });
      await fetchInvoices();
    } catch (error) {
      console.error('Failed to approve invoice:', error);
      toast({ title: 'Error', description: 'Failed to approve invoice', variant: 'destructive' });
    }
  };

  const handlePay = async (id: string) => {
    try {
      await financeApiService.updateAccountPayableStatus(Number(id), 'Paid');
      toast({ title: 'Success', description: 'Invoice marked as paid' });
      await fetchInvoices();
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      toast({ title: 'Error', description: 'Failed to pay invoice', variant: 'destructive' });
    }
  };

  const totalPending = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const totalApproved = invoices.filter(inv => inv.status === 'Approved').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Accounts Payable</h2>
          <p className="text-muted-foreground text-white">Manage vendor invoices and payments</p>
        </div>
        <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
          <Dialog open={isAddingInvoice} onOpenChange={setIsAddingInvoice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Invoice</DialogTitle>
                <DialogDescription>
                  Enter vendor invoice details. Journal entries will be created when approved.
                </DialogDescription>
              </DialogHeader>
              <InvoiceForm 
                type="payable"
                onSubmit={handleAddInvoice} 
                onCancel={handleCancelAddInvoice} 
                accounts={accounts}
                generateInvoiceNumber={generateAccountPayableInvoiceNumber}
              />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'Pending').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'Overdue').length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved for Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalApproved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(inv => inv.status === 'Approved').length} invoices
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
                  placeholder="Search by invoice number, vendor, or description..."
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {filteredInvoices.length} of {invoices.length} invoices displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setIsViewDialog(true); }}>
                        View
                      </Button>
                      <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                        <Button variant="outline" size="sm" disabled={invoice.status !== 'Pending'} onClick={() => handleApprove(invoice.id)}>
                          Approve
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                        <Button variant="outline" size="sm" disabled={invoice.status !== 'Approved'} onClick={() => handlePay(invoice.id)}>
                          Pay
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

      <Dialog open={isViewDialog} onOpenChange={setIsViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Invoice #:</Label><p className="font-mono">{selectedInvoice.invoiceNumber}</p></div>
                <div><Label>Status:</Label><Badge variant={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge></div>
                <div><Label>Vendor:</Label><p>{selectedInvoice.vendor}</p></div>
                <div><Label>Amount:</Label><p className="font-mono">${selectedInvoice.amount.toLocaleString()}</p></div>
                <div><Label>Issue Date:</Label><p>{selectedInvoice.issueDate}</p></div>
                <div><Label>Due Date:</Label><p>{selectedInvoice.dueDate}</p></div>
              </div>
              <div><Label>Description:</Label><p>{selectedInvoice.description}</p></div>
              {selectedInvoice.category && <div><Label>Category:</Label><p>{selectedInvoice.category}</p></div>}
              {selectedInvoice.paymentTerms && <div><Label>Payment Terms:</Label><p>{selectedInvoice.paymentTerms}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
