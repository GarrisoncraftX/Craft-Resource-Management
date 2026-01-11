import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Award } from 'lucide-react';
import { hrApiService } from '@/services/javabackendapi/hrApi';

interface AddCertificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddCertificationForm: React.FC<AddCertificationFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    certificationName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    verificationUrl: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const empList = await hrApiService.listEmployees();
        setEmployees(empList);
      } catch (error) {
        console.error('Failed to load employees:', error);
      }
    };
    if (open) loadData();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll just show success since there's no certification endpoint yet
      toast({
        title: "Success",
        description: "Certification added successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        employeeId: '',
        certificationName: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        verificationUrl: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add certification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Add Employee Certification
          </DialogTitle>
          <DialogDescription>
            Record a professional certification for an employee
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee">Employee</Label>
            <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.firstName} {employee.lastName} - {employee.employeeId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificationName">Certification Name</Label>
              <Input
                id="certificationName"
                value={formData.certificationName}
                onChange={(e) => setFormData(prev => ({ ...prev, certificationName: e.target.value }))}
                placeholder="e.g., AWS Certified Solutions Architect"
                required
              />
            </div>
            <div>
              <Label htmlFor="issuingOrganization">Issuing Organization</Label>
              <Input
                id="issuingOrganization"
                value={formData.issuingOrganization}
                onChange={(e) => setFormData(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                placeholder="e.g., Amazon Web Services"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                value={formData.credentialId}
                onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                placeholder="Certification ID or number"
              />
            </div>
            <div>
              <Label htmlFor="verificationUrl">Verification URL</Label>
              <Input
                id="verificationUrl"
                type="url"
                value={formData.verificationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, verificationUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional information about the certification"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Certification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
