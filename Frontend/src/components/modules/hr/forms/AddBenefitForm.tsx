import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Heart, Shield, Car, Plane } from 'lucide-react';

interface AddBenefitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddBenefitForm: React.FC<AddBenefitFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    coverage: '',
    monthlyCost: '',
    employeeCostShare: '',
    eligibleRoles: [] as string[],
    isActive: true,
    enrollmentPeriod: '',
    provider: ''
  });

  const [loading, setLoading] = useState(false);

  const benefitTypes = [
    { value: 'health', label: 'Health Insurance', icon: Heart },
    { value: 'life', label: 'Life Insurance', icon: Shield },
    { value: 'transportation', label: 'Transportation', icon: Car },
    { value: 'vacation', label: 'Time Off', icon: Plane },
    { value: 'dental', label: 'Dental Insurance', icon: Heart },
    { value: 'vision', label: 'Vision Insurance', icon: Heart }
  ];

  const roles = [
    { id: '1', name: 'Manager' },
    { id: '2', name: 'Analyst' },
    { id: '3', name: 'Engineer' },
    { id: '4', name: 'Coordinator' },
    { id: '5', name: 'Director' }
  ];

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleRoles: prev.eligibleRoles.includes(roleId)
        ? prev.eligibleRoles.filter(id => id !== roleId)
        : [...prev.eligibleRoles, roleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Benefit plan created successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        name: '',
        type: '',
        description: '',
        coverage: '',
        monthlyCost: '',
        employeeCostShare: '',
        eligibleRoles: [],
        isActive: true,
        enrollmentPeriod: '',
        provider: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create benefit plan"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Benefit Plan</DialogTitle>
          <DialogDescription>
            Create a new benefit plan for employees
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Benefit Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Health Insurance"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Benefit Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the benefit"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="coverage">Coverage Details</Label>
            <Input
              id="coverage"
              value={formData.coverage}
              onChange={(e) => setFormData(prev => ({ ...prev, coverage: e.target.value }))}
              placeholder="e.g., Medical, Dental, Vision"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthlyCost">Monthly Cost ($)</Label>
              <Input
                id="monthlyCost"
                type="number"
                value={formData.monthlyCost}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyCost: e.target.value }))}
                placeholder="450"
                required
              />
            </div>
            <div>
              <Label htmlFor="employeeCostShare">Employee Share (%)</Label>
              <Input
                id="employeeCostShare"
                type="number"
                value={formData.employeeCostShare}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeCostShare: e.target.value }))}
                placeholder="20"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="enrollmentPeriod">Enrollment Period</Label>
              <Select value={formData.enrollmentPeriod} onValueChange={(value) => setFormData(prev => ({ ...prev, enrollmentPeriod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
              placeholder="e.g., BlueCross BlueShield"
            />
          </div>
          
          <div>
            <Label>Eligible Roles</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={formData.eligibleRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
            />
            <Label htmlFor="isActive">Active (Available for enrollment)</Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Benefit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};