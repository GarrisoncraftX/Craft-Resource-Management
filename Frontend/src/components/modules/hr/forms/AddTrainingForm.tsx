import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Calendar, Users, DollarSign } from 'lucide-react';

interface AddTrainingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddTrainingForm: React.FC<AddTrainingFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    instructor: '',
    duration: '',
    capacity: '',
    startDate: '',
    endDate: '',
    cost: '',
    location: '',
    deliveryMethod: '',
    prerequisites: '',
    objectives: '',
    materials: '',
    isMandatory: false,
    certificateAwarded: false
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    'Technical Skills',
    'Leadership Development',
    'Compliance Training',
    'Safety Training',
    'Soft Skills',
    'Professional Development',
    'Industry Specific'
  ];

  const deliveryMethods = [
    'In-Person',
    'Online',
    'Hybrid',
    'Self-Paced',
    'Workshop',
    'Seminar'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Training program created successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        title: '',
        category: '',
        description: '',
        instructor: '',
        duration: '',
        capacity: '',
        startDate: '',
        endDate: '',
        cost: '',
        location: '',
        deliveryMethod: '',
        prerequisites: '',
        objectives: '',
        materials: '',
        isMandatory: false,
        certificateAwarded: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create training program"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Training Program
          </DialogTitle>
          <DialogDescription>
            Set up a new training program for employees
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Program Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Advanced Excel Training"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase().replace(' ', '-')}>
                      {category}
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
              placeholder="Brief description of the training program"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="Instructor name or company"
                required
              />
            </div>
            <div>
              <Label htmlFor="deliveryMethod">Delivery Method</Label>
              <Select value={formData.deliveryMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryMethods.map((method) => (
                    <SelectItem key={method} value={method.toLowerCase().replace(' ', '-')}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="8"
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="25"
                required
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost per Person ($)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Location/Platform</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Conference Room A, Zoom, Teams"
            />
          </div>
          
          <div>
            <Label htmlFor="objectives">Learning Objectives</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
              placeholder="What participants will learn or achieve"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Textarea
              id="prerequisites"
              value={formData.prerequisites}
              onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
              placeholder="Required skills or experience"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="materials">Materials/Resources</Label>
            <Textarea
              id="materials"
              value={formData.materials}
              onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
              placeholder="Books, software, equipment needed"
              rows={2}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mandatory"
                checked={formData.isMandatory}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMandatory: !!checked }))}
              />
              <Label htmlFor="mandatory">Mandatory Training</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="certificate"
                checked={formData.certificateAwarded}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, certificateAwarded: !!checked }))}
              />
              <Label htmlFor="certificate">Certificate Awarded</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};