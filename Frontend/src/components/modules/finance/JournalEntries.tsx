import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Search } from 'lucide-react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { JournalEntryForm } from './JournalEntryForm';
import { journalApi } from '@/services/javabackendapi/journalApi';
import { fetchEmployees } from '@/services/api';
import type { JournalEntry } from '@/types/journal';
import type { Employee } from '@/types/hr';

const getStatusBadgeVariant = (status: 'Draft' | 'Posted' | 'Approved'): 'default' | 'secondary' | 'outline' => {
  const statusMap: Record<'Draft' | 'Posted' | 'Approved', 'default' | 'secondary' | 'outline'> = {
    'Posted': 'default',
    'Approved': 'secondary',
    'Draft': 'outline'
  };
  return statusMap[status];
};


export const JournalEntries: React.FC = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load journal entries and employees on component mount
  useEffect(() => {
    loadJournalEntries();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeeList = await fetchEmployees();
      setEmployees(employeeList);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await journalApi.getAll();
      setJournalEntries(entries);
    } catch (err) {
      setError('Failed to load journal entries');
      console.error('Error loading journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateEntry = async (entryData: JournalEntry) => {
    try {
      setLoading(true);
      setError(null);
      
      const newEntry = await journalApi.create({
        entryDate: entryData.entryDate,
        description: entryData.description,
        amount: entryData.amount,
        accountCode: entryData.accountCode,
      });
      
      setJournalEntries([...journalEntries, newEntry]);
      setIsAddingEntry(false);
    } catch (err) {
      setError('Failed to create journal entry');
      console.error('Error creating entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntry = async (id: string, updatedData: JournalEntry) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedEntry = await journalApi.update(id, {
        entryDate: updatedData.entryDate,
        description: updatedData.description,
        amount: updatedData.amount,
        accountCode: updatedData.accountCode,
      });
      
      setJournalEntries(journalEntries.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));
    } catch (err) {
      setError('Failed to update journal entry');
      console.error('Error updating entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        setLoading(true);
        setError(null);
        await journalApi.delete(id);
        setJournalEntries(journalEntries.filter(entry => entry.id !== id));
      } catch (err) {
        setError('Failed to delete journal entry');
        console.error('Error deleting entry:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    
  };

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = (entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (entry.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getCreatorName = (createdBy: string) => {
    const creator = employees.find(emp => emp.id == createdBy);
    return creator ? `${creator.firstName} ${creator.lastName || ''}`.trim() : createdBy;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Journal Entries</h2>
          <p className="text-muted-foreground">Manage accounting journal entries</p>
        </div>
        <PermissionGuard requiredPermissions={['finance.journal.create']}>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
                <DialogDescription>
                  Add a new journal entry with debit and credit lines
                </DialogDescription>
              </DialogHeader>
              <JournalEntryForm onSubmit={handleCreateEntry} />
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entry Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Entries</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reference or description..."
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
                  <SelectItem value="Posted">Posted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
          <CardDescription>
            {filteredEntries.length} of {journalEntries.length} entries displayed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">{entry.reference}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${entry.totalDebit?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCreatorName(entry.createdBy)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewEntry(entry)}
                        >
                          View
                        </Button>
                        <PermissionGuard requiredPermissions={['finance.journal.update']}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateEntry(entry.id, entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard requiredPermissions={['finance.journal.delete']}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            Delete
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Journal Entry Details - {selectedEntry.reference}</DialogTitle>
              <DialogDescription>
                Entry dated {new Date(selectedEntry.entryDate).toLocaleDateString()} created by {getCreatorName(selectedEntry.createdBy)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">{selectedEntry.description}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedEntry.entries || []).map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm">{line.accountCode}</div>
                          <div className="text-sm text-muted-foreground">{line.accountName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debit > 0 ? `$${line.debit.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.credit > 0 ? `$${line.credit.toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell colSpan={2} className="font-medium">Totals</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${selectedEntry.totalDebit?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${selectedEntry.totalCredit?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
