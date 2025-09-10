import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { apiClient } from '@/utils/apiClient';
import { AccountForm } from './AccountForm';
import { Account } from '@/types/api'
import { mockAccountData } from '@/services/mockData.ts'

export const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBadgeVariant = (accountType: string) => {
    const type = accountType.trim().toLowerCase();
    switch (type) {
      case 'asset':
        return 'success';
      case 'liability':
        return 'destructive';
      case 'equity':
        return 'warning';
      case 'revenue':
        return 'secondary';
      case 'expense':
        return 'accent';
      default:
        return 'outline';
    }
  };

  /**
   * Fetches account data from the API 
   * or falls back to mock data if the API call fails.
   */
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const Accountdata = await apiClient.get('/finance/accounts');
      console.log("Fetched accounts from API:", Accountdata);
      setAccounts(Accountdata.map((account: Account) => ({
        ...account,
      })));
    } catch (err) {
      console.error("Failed to fetch accounts:", err); 
      setError('Failed to fetch accounts, using mock data.');
      setAccounts(mockAccountData.map(account => ({
        ...account,
      })));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = (account.accountName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.accountCode ?? '').includes(searchTerm);
    const matchesType = selectedType === 'all' || account.accountType.toLowerCase() === selectedType.toLowerCase() || selectedType === 'all';
    return matchesSearch && matchesType;
  });

  /**
   * Handles adding a new account, attempting to save to API first,
   *  then falling back to local state.
   * @param account The account data to add.
   */
  const handleAddAccount = async (account: Account) => {
    try {
      const savedAccount = await apiClient.post('/finance/accounts', account);
      setAccounts(prev => [...prev, savedAccount]);
      setIsAddingAccount(false);
    } catch (err) {
      console.error("Failed to add account:", err); 
      // fallback to local update
      setAccounts(prev => [...prev, account]);
      setIsAddingAccount(false);
    }
  };

  /**
   * Handles updating an existing account, attempting to save to API first,
   *  then falling back to local state.
   * @param account The account data to update.
   */
  const handleUpdateAccount = async (account: Account) => {
    try {
      const updatedAccount = await apiClient.put(`/finance/accounts/${account.id}`, account);
      setAccounts(prev => prev.map(acc => acc.id === account.id ? updatedAccount : acc));
      setEditingAccount(null);
      setIsAddingAccount(false); 
    } catch (err) {
      console.error("Failed to update account:", err); 
      // fallback to local update
      setAccounts(prev => prev.map(acc => acc.id === account.id ? account : acc));
      setEditingAccount(null);
      setIsAddingAccount(false); 
    }
  };

  /**
   * Handles deleting an account, attempting to delete from API first, 
   * then falling back to local state.
   * @param accountId The ID of the account to delete.
   */
  const handleDeleteAccount = async (accountId: string) => {
    try {
      await apiClient.delete(`/finance/accounts/${accountId}`);
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      console.error("Failed to delete account:", err); 
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Chart of Accounts</h2>
          <p className="text-muted-foreground">Manage your organization's account structure</p>
          {error && <p className="text-destructive">{error}</p>}
          {loading && <p>Loading accounts...</p>}
        </div>
        <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
          <Dialog open={isAddingAccount} onOpenChange={(open) => {
            setIsAddingAccount(open);
            if (!open) {
              setEditingAccount(null); 
            }
          }}>
            <DialogTrigger asChild>
              <Button className='bg-blue-900' onClick={() => setEditingAccount(null)}> 
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                <DialogDescription>
                  {editingAccount ? 'Update account details' : 'Create a new account in the chart of accounts'}
                </DialogDescription>
              </DialogHeader>
              <AccountForm
                account={editingAccount || undefined}
                onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
                onCancel={() => {
                  setIsAddingAccount(false);
                  setEditingAccount(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Accounts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Account Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Overview</CardTitle>
          <CardDescription>
            {filteredAccounts.length} of {accounts.length} accounts displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.accountCode}</TableCell>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(account.accountType)}>
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.description}</TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingAccount(account);
                          setIsAddingAccount(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard requiredPermissions={['finance.manage_accounts']}>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteAccount(account.id)}>
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};
