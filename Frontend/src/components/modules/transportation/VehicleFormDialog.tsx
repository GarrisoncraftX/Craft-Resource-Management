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
import type { Vehicle } from '@/types/nodejsbackendapi/transportationTypes';

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle;
}

export const VehicleFormDialog: React.FC<VehicleFormDialogProps> = ({ open, onOpenChange, vehicle }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: vehicle || {
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vehicleType: 'car',
      capacity: 5,
      fuelType: 'petrol',
      status: 'active',
      mileage: 0,
      department: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => transportationApiService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Success', description: 'Vehicle created successfully' });
      reset();
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create vehicle', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => transportationApiService.updateVehicle(vehicle!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Success', description: 'Vehicle updated successfully' });
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update vehicle', variant: 'destructive' })
  });

  const onSubmit = (data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (vehicle?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" {...register('registrationNumber', { required: true })} />
            </div>
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select onValueChange={(value) => setValue('vehicleType', value as any)} defaultValue={watch('vehicleType')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" {...register('make', { required: true })} />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model', { required: true })} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" {...register('year', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" {...register('capacity', { required: true, valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select onValueChange={(value) => setValue('fuelType', value as any)} defaultValue={watch('fuelType')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" type="number" {...register('mileage', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue={watch('status')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register('department', { required: true })} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {vehicle ? 'Update' : 'Create'} Vehicle
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
