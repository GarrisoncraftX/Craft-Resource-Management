import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { toast } from '@/hooks/use-toast';
import type { Driver } from '@/types/nodejsbackendapi/transportationTypes';

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver;
}

export const DriverFormDialog: React.FC<DriverFormDialogProps> = ({ open, onOpenChange, driver }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: driver || {
      employeeId: '',
      licenseNumber: '',
      licenseType: 'B',
      licenseExpiryDate: '',
      status: 'active',
      experienceYears: 0,
      contactNumber: '',
      emergencyContact: '',
      certifications: []
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => transportationApiService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Success', description: 'Driver created successfully' });
      reset();
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create driver', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Driver>) => transportationApiService.updateDriver(driver!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Success', description: 'Driver updated successfully' });
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update driver', variant: 'destructive' })
  });

  const onSubmit = (data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (driver?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...register('employeeId', { required: true })} />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" {...register('licenseNumber', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="licenseType">License Type</Label>
              <Select onValueChange={(value) => setValue('licenseType', value as any)} defaultValue={watch('licenseType')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Class A</SelectItem>
                  <SelectItem value="B">Class B</SelectItem>
                  <SelectItem value="C">Class C</SelectItem>
                  <SelectItem value="D">Class D</SelectItem>
                  <SelectItem value="E">Class E</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="licenseExpiryDate">License Expiry</Label>
              <Input id="licenseExpiryDate" type="date" {...register('licenseExpiryDate', { required: true })} />
            </div>
            <div>
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input id="experienceYears" type="number" {...register('experienceYears', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" {...register('contactNumber', { required: true })} />
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...register('emergencyContact', { required: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={watch('status')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {driver ? 'Update' : 'Create'} Driver
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
