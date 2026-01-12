import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ClipboardCheck, Star, Target, Calendar } from 'lucide-react';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { fetchDepartments, fetchRoles } from '@/services/api';

interface AddPerformanceReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddPerformanceReviewForm: React.FC<AddPerformanceReviewFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewerId: '',
    reviewType: '',
    reviewPeriod: '',
    scheduledDate: '',
    dueDate: '',
    goals: '',
    achievements: '',
    areasForImprovement: '',
    overallRating: '',
    comments: '',
    nextReviewDate: '',
    includeGoalSetting: true,
    includeDevelopmentPlan: false,
    isComplete: false
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [empList, deptList, roleList] = await Promise.all([
          hrApiService.listEmployees(),
          fetchDepartments(),
          fetchRoles()
        ]);
        setEmployees(empList);
        setReviewers(empList);
        setDepartments(deptList);
        setRoles(roleList);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    if (open) loadData();
  }, [open]);

  const reviewTypes = [
    'Annual Review',
    'Mid-Year Review',
    'Quarterly Review',
    'Probationary Review',
    '90-Day Review',
    'Project Review',
    'Promotion Review'
  ];

  const ratingScale = [
    { value: '5', label: '5 - Exceptional' },
    { value: '4', label: '4 - Exceeds Expectations' },
    { value: '3', label: '3 - Meets Expectations' },
    { value: '2', label: '2 - Below Expectations' },
    { value: '1', label: '1 - Unsatisfactory' }
  ];

  const getDepartmentName = (deptId: number) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || '';
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || '';
  };

  const mockEmployees = employees.map(emp => ({
    id: emp.id.toString(),
    name: `${emp.firstName} ${emp.lastName}`,
    department: getDepartmentName(emp.departmentId)
  }));

  const mockReviewers = reviewers.map(emp => ({
    id: emp.id.toString(),
    name: `${emp.firstName} ${emp.lastName}`,
    title: getRoleName(emp.roleId)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const performanceReview = {
        employeeId: parseInt(formData.employeeId),
        reviewerId: parseInt(formData.reviewerId),
        reviewDate: formData.scheduledDate || new Date().toISOString(),
        rating: parseFloat(formData.overallRating),
        comments: formData.comments,
        goals: formData.goals
      };

      await hrApiService.createPerformanceReview(performanceReview);
      
      toast({
        title: "Success",
        description: "Performance review scheduled successfully!"
      });
      
      onSuccess?.();
      onOpenChange(false);
      setFormData({
        employeeId: '',
        reviewerId: '',
        reviewType: '',
        reviewPeriod: '',
        scheduledDate: '',
        dueDate: '',
        goals: '',
        achievements: '',
        areasForImprovement: '',
        overallRating: '',
        comments: '',
        nextReviewDate: '',
        includeGoalSetting: true,
        includeDevelopmentPlan: false,
        isComplete: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule performance review",
        variant: "destructive"
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
            <ClipboardCheck className="h-5 w-5" />
            Schedule Performance Review
          </DialogTitle>
          <DialogDescription>
            Create a new performance review for an employee
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}{employee.department ? ` - ${employee.department}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reviewer">Reviewer</Label>
              <Select value={formData.reviewerId} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewerId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {mockReviewers.map((reviewer) => (
                    <SelectItem key={reviewer.id} value={reviewer.id}>
                      {reviewer.name}{reviewer.title ? ` - ${reviewer.title}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewType">Review Type</Label>
              <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reviewTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reviewPeriod">Review Period</Label>
              <Input
                id="reviewPeriod"
                value={formData.reviewPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                placeholder="e.g., Q1 2024, Jan-Dec 2023"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nextReviewDate">Next Review Date</Label>
              <Input
                id="nextReviewDate"
                type="date"
                value={formData.nextReviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextReviewDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="goals">Goals & Objectives</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="Key goals and objectives for this review period"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
              placeholder="Notable achievements and successes"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="areasForImprovement">Areas for Improvement</Label>
            <Textarea
              id="areasForImprovement"
              value={formData.areasForImprovement}
              onChange={(e) => setFormData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
              placeholder="Areas where employee can improve"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overallRating">Overall Rating</Label>
              <Select value={formData.overallRating} onValueChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingScale.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Any additional feedback or comments"
              rows={3}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="goalSetting"
                checked={formData.includeGoalSetting}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeGoalSetting: !!checked }))}
              />
              <Label htmlFor="goalSetting">Include Goal Setting Session</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="developmentPlan"
                checked={formData.includeDevelopmentPlan}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDevelopmentPlan: !!checked }))}
              />
              <Label htmlFor="developmentPlan">Include Development Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isComplete"
                checked={formData.isComplete}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isComplete: !!checked }))}
              />
              <Label htmlFor="isComplete">Mark as Complete</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Schedule Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};