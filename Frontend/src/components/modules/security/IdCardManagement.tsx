import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Ban } from 'lucide-react';
import { securityApiService, type IdCard } from '@/services/javabackendapi/securityApi';
import { mockIdCards } from '@/services/mockData/security';
import { useToast } from '@/hooks/use-toast';

export const IdCardManagement: React.FC = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<IdCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    department: '',
    nationalId: '',
    phoneNumber: '',
    status: 'Active',
  });

  useEffect(() => {
    loadIdCards();
  }, []);

  const loadIdCards = async () => {
    try {
      setIsLoading(true);
      const data = await securityApiService.getIdCards();
      setCards(data);
    } catch (error) {
      console.warn('Failed to load ID cards from API, using mock data:', error);
      setCards(mockIdCards);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await securityApiService.issueIdCard(formData);
      toast({ title: 'Success', description: 'ID card issued successfully' });
      setIsDialogOpen(false);
      setFormData({ firstName: '', lastName: '', employeeId: '', email: '', department: '', nationalId: '', phoneNumber: '', status: 'Active' });
      loadIdCards();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to issue ID card', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (cardId: string) => {
    try {
      await securityApiService.revokeIdCard(cardId);
      toast({ title: 'Success', description: 'ID card revoked successfully' });
      loadIdCards();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to revoke ID card', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ID Card Management</h2>
          <p className="text-muted-foreground">Issue, revoke, and audit employee ID cards</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Issue ID Card</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Issue New ID Card</DialogTitle>
                <DialogDescription>Enter employee details to issue a new ID card</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input id="nationalId" value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Issue Card
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ID Cards</CardTitle>
          <CardDescription>All issued employee ID cards ({cards.length})</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((c) => (
                  <TableRow key={c.cardId}>
                    <TableCell className="font-medium">{c.cardId}</TableCell>
                    <TableCell>{c.firstName} {c.lastName}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.department}</TableCell>
                    <TableCell>{c.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'Active' ? 'default' : 'secondary'}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.status === 'Active' && (
                        <Button size="sm" variant="outline" onClick={() => handleRevoke(c.cardId)}>
                          <Ban className="h-3 w-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IdCardManagement;
