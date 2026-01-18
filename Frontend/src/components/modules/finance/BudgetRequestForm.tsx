import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetRequest, Department } from '@/types/api';
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { fetchDepartments } from '@/services/api';
import { financeApiService } from '@/services/javabackendapi/financeApi';
import { useToast } from '@/hooks/use-toast';

export const BudgetRequestForm: React.FC<{ onSubmit: (request: BudgetRequest) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();


  const [formData, setFormData] = useState({
    department: '',
    departmentId: 0, 
    category: '',
    requestedAmount: 0,
    justification: '',
  });


  useEffect(() => {
   const fetchDepartmentsData = async () => {
    setIsDepartmentsLoading(true);
       try {
         const departmentsData = await fetchDepartments();
         setDepartments(departmentsData);
          setIsDepartmentsLoading(false);
       } catch (error) {
         console.error("Failed to fetch departments", error);
          setIsDepartmentsLoading(false);
       }
     };
     fetchDepartmentsData();
   }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeApiService.createBudgetRequest({
        ...formData,
        status: 'Pending',
        requestedBy: user?.firstName || 'Unknown User',
        request_date: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Request Submitted",
        description: "Budget request has been successfully submitted.",
      });
      onSubmit({
        ...formData,
        status: 'Pending',
        requestedBy: user?.firstName || 'Unknown User',
        requestDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Failed to create budget request", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit budget request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.departmentId?.toString()}
            onValueChange={(value) => {
              const selectedDepartment = departments.find(dept => dept.id === value);
              setFormData({ 
                ...formData, 
                departmentId: Number(value), 
                department: selectedDepartment ? selectedDepartment.name : '' 
              });
            }}
            disabled={isDepartmentsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isDepartmentsLoading ? "Loading departments..." : "Select department"}
              />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Budget category"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requestedAmount">Requested Amount</Label>
        <Input
          id="requestedAmount"
          type="number"
          value={formData.requestedAmount}
          onChange={(e) => setFormData({ ...formData, requestedAmount: Number.parseFloat(e.target.value) })}
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>

      <div>
        <Label htmlFor="justification">Justification</Label>
        <Input
          id="justification"
          value={formData.justification}
          onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
          placeholder="Explain why this budget is needed"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Request
        </Button>
      </div>
    </form>
  );
};
