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
import type { Trip } from '@/types/nodejsbackendapi/transportationTypes';

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
}

export const TripFormDialog: React.FC<TripFormDialogProps> = ({ open, onOpenChange, trip }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: trip || {
      vehicleId: '',
      driverId: '',
      requesterId: '',
      purpose: '',
      startDate: '',
      endDate: '',
      startLocation: '',
      endLocation: '',
      distance: 0,
      status: 'scheduled',
      notes: ''
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
    mutationFn: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => transportationApiService.createTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Success', description: 'Trip created successfully' });
      reset();
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create trip', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Trip>) => transportationApiService.updateTrip(trip!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Success', description: 'Trip updated successfully' });
      onOpenChange(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update trip', variant: 'destructive' })
  });

  const onSubmit = (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (trip?.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trip ? 'Edit Trip' : 'Schedule New Trip'}</DialogTitle>
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
                    <SelectItem key={d.id} value={d.id!}>{d.employeeId} - {d.licenseNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="requesterId">Requester ID</Label>
            <Input id="requesterId" {...register('requesterId', { required: true })} />
          </div>
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" {...register('purpose', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date/Time</Label>
              <Input id="startDate" type="datetime-local" {...register('startDate', { required: true })} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date/Time</Label>
              <Input id="endDate" type="datetime-local" {...register('endDate', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startLocation">Start Location</Label>
              <Input id="startLocation" {...register('startLocation', { required: true })} />
            </div>
            <div>
              <Label htmlFor="endLocation">End Location</Label>
              <Input id="endLocation" {...register('endLocation', { required: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="distance">Distance (km)</Label>
            <Input id="distance" type="number" step="0.1" {...register('distance', { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {trip ? 'Update' : 'Schedule'} Trip
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
