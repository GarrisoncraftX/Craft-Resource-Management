import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transportationApiService } from '@/services/nodejsbackendapi/transportationApi';
import { toast } from '@/hooks/use-toast';
import type { MaintenanceRecord, FuelRecord } from '@/types/nodejsbackendapi/transportationTypes';

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MaintenanceRecord;
}

export const MaintenanceFormDialog: React.FC<MaintenanceFormDialogProps> = ({ open, onOpenChange, record }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: record || {
      vehicleId: '',
      maintenanceType: 'routine',
      description: '',
      date: '',
      cost: 0,
      mileage: 0,
      performedBy: '',
      partsReplaced: []
    }
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => transportationApiService.getVehicles()
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => transportationApiService.createMaintenanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      toast({ title: 'Success', description: 'Maintenance record created' });
      reset();
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create record', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<MaintenanceRecord>) => transportationApiService.updateMaintenanceRecord(record!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      toast({ title: 'Success', description: 'Maintenance record updated' });
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update record', variant: 'destructive' })
  });

  const onSubmit = (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (record?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="vehicleId">Vehicle</Label>
            <Select onValueChange={(value) => setValue('vehicleId', value)} defaultValue={watch('vehicleId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles?.map((v) => (
                  <SelectItem key={v.id} value={v.id!}>{v.registrationNumber} - {v.make} {v.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maintenanceType">Type</Label>
              <Select onValueChange={(value) => setValue('maintenanceType', value as any)} defaultValue={watch('maintenanceType')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date', { required: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description', { required: true })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" step="0.01" {...register('cost', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" type="number" {...register('mileage', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="performedBy">Performed By</Label>
              <Input id="performedBy" {...register('performedBy', { required: true })} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {record ? 'Update' : 'Create'} Record
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface FuelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: FuelRecord;
}

export const FuelFormDialog: React.FC<FuelFormDialogProps> = ({ open, onOpenChange, record }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: record || {
      vehicleId: '',
      driverId: '',
      date: '',
      fuelType: '',
      quantity: 0,
      cost: 0,
      mileage: 0,
      station: ''
    }
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => transportationApiService.getVehicles()
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => transportationApiService.getDrivers()
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>) => transportationApiService.createFuelRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-records'] });
      toast({ title: 'Success', description: 'Fuel record created' });
      reset();
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create record', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FuelRecord>) => transportationApiService.updateFuelRecord(record!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-records'] });
      toast({ title: 'Success', description: 'Fuel record updated' });
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update record', variant: 'destructive' })
  });

  const onSubmit = (data: Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (record?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Fuel Record' : 'Add Fuel Record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select onValueChange={(value) => setValue('vehicleId', value)} defaultValue={watch('vehicleId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.id!}>{v.registrationNumber} - {v.make} {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="driverId">Driver</Label>
              <Select onValueChange={(value) => setValue('driverId', value)} defaultValue={watch('driverId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((d) => (
                    <SelectItem key={d.id} value={d.id!}>{d.employeeId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date', { required: true })} />
            </div>
            <div>
              <Label htmlFor="station">Station</Label>
              <Input id="station" {...register('station', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Input id="fuelType" {...register('fuelType', { required: true })} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity (L)</Label>
              <Input id="quantity" type="number" step="0.1" {...register('quantity', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" step="0.01" {...register('cost', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="mileage">Mileage</Label>
            <Input id="mileage" type="number" {...register('mileage', { required: true, valueAsNumber: true })} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {record ? 'Update' : 'Create'} Record
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
