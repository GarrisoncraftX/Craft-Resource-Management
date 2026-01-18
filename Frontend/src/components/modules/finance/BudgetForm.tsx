import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetItem, Department } from '@/types/api';
import { lookupApiService } from '@/services/nodejsbackendapi/lookupApi';

interface BudgetFormProps {
  budget?: BudgetItem;
  onSubmit: (budget: BudgetItem) => void;
  onCancel?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    department_id: budget?.department_id || 0,
    category: budget?.category || '',
    budgetAmount: budget?.budgetAmount || 0,
    budgetName: budget?.budgetName || budget?.category || '',
    description: budget?.description || '',
    fiscal_year: budget?.fiscal_year || new Date().getFullYear(),
    startDate: budget?.startDate || '',
    endDate: budget?.endDate || '',
    spentAmount: budget?.spentAmount || 0,
    allocated_amount: budget?.allocated_amount || 0,
  });

  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (budget) {
      setFormData({
        department_id: budget.department_id,
        category: budget.category,
        budgetAmount: budget.budgetAmount,
        budgetName: budget.budgetName || budget.category,
        description: budget.description,
        fiscal_year: budget.fiscal_year,
        startDate: budget.startDate,
        endDate: budget.endDate,
        spentAmount: budget.spentAmount,
        allocated_amount: budget.allocated_amount || 0,
      });
    }
  }, [budget]);

  useEffect(() => {
    const fetchDepartmentsData = async () => {
      try {
        const departmentsData = await lookupApiService.getDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartmentsData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submittedData: Partial<BudgetItem> = {
      id: budget?.id || Date.now().toString(),
      department_id: formData.department_id,
      departmentId: formData.department_id,
      category: formData.category,
      budgetName: formData.budgetName || formData.category,
      description: formData.description,
      fiscal_year: (formData.fiscal_year || new Date().getFullYear()).toString(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      // Use budgetAmount as the primary amount field
      amount: formData.budgetAmount,
      total_amount: formData.budgetAmount, // Sync with amount
      budgetAmount: formData.budgetAmount,
      allocated_amount: formData.allocated_amount || 0,
      spentAmount: formData.spentAmount,
      // Don't send remaining_amount - it's computed by DB
      department: formData.department_id.toString(),
      remaining: formData.budgetAmount - formData.spentAmount,
      percentage: formData.budgetAmount > 0 ? (formData.spentAmount / formData.budgetAmount) * 100 : 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    // Remove status field - it's managed by backend
    delete submittedData.status;
    delete submittedData.remainingAmount; // Don't send computed field
    onSubmit(submittedData as BudgetItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="budgetName">Budget Name *</Label>
        <Input
          id="budgetName"
          value={formData.budgetName}
          onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
          placeholder="Budget name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Budget description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department_id">Department</Label>
          <Select value={formData.department_id.toString()} onValueChange={(value) => setFormData({ ...formData, department_id: Number.parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budgetAmount">Budget Amount</Label>
          <Input
            id="budgetAmount"
            type="number"
            value={formData.budgetAmount}
            onChange={(e) => setFormData({ ...formData, budgetAmount: Number.parseFloat(e.target.value) })}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
        <div>
          <Label htmlFor="spentAmount">Spent Amount</Label>
          <Input
            id="spentAmount"
            type="number"
            value={formData.spentAmount}
            onChange={(e) => setFormData({ ...formData, spentAmount: Number.parseFloat(e.target.value) })}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fiscal_year">Fiscal Year</Label>
          <Input
            id="fiscal_year"
            type="number"
            value={formData.fiscal_year}
            onChange={(e) => setFormData({ ...formData, fiscal_year: Number.parseInt(e.target.value) })}
            placeholder="2024"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {budget ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
};
