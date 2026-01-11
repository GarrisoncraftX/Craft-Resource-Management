import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Users, BookOpen } from 'lucide-react';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { Input } from '@/components/ui/input';

interface EnrollEmployeeTrainingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EnrollEmployeeTrainingForm: React.FC<EnrollEmployeeTrainingFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    trainingCourseId: '',
    startDate: '',
    endDate: '',
    status: 'not-started'
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [empList, courseList] = await Promise.all([
          hrApiService.listEmployees(),
          hrApiService.getAllTrainingCourses()
        ]);
        setEmployees(empList);
        setCourses(courseList);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    if (open) loadData();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeTraining = {
        employeeId: parseInt(formData.employeeId),
        trainingCourseId: parseInt(formData.trainingCourseId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      };

      await hrApiService.createEmployeeTraining(employeeTraining);
      
      toast({
        title: "Success",
        description: "Employee enrolled in training successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        employeeId: '',
        trainingCourseId: '',
        startDate: '',
        endDate: '',
        status: 'not-started'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll employee in training",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Enroll Employee in Training
          </DialogTitle>
          <DialogDescription>
            Assign an employee to a training program
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

          <div>
            <Label htmlFor="course">Training Program</Label>
            <Select value={formData.trainingCourseId} onValueChange={(value) => setFormData(prev => ({ ...prev, trainingCourseId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select training program" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name} ({course.duration} hours)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enrolling...' : 'Enroll Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
