import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetItem, Department } from '@/types/api';
import { fetchDepartments } from '@/services/api';

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
    period: budget?.period || 'Q1 2024',
    budgetName: budget?.budgetName || '',
    description: budget?.description || '',
    fiscal_year: budget?.fiscal_year || new Date().getFullYear(),
    startDate: budget?.startDate || '',
    endDate: budget?.endDate || '',
    total_amount: budget?.total_amount || 0,
    allocated_amount: budget?.allocated_amount || 0,
    spentAmount: budget?.spentAmount || 0,
  });

  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (budget) {
      setFormData({
        department_id: budget.department_id,
        category: budget.category,
        budgetAmount: budget.budgetAmount,
        period: budget.period,
        budgetName: budget.budgetName,
        description: budget.description,
        fiscal_year: budget.fiscal_year,
        startDate: budget.startDate,
        endDate: budget.endDate,
        total_amount: budget.total_amount,
        allocated_amount: budget.allocated_amount,
        spentAmount: budget.spentAmount,
      });
    }
  }, [budget]);

  useEffect(() => {
    const fetchDepartmentsData = async () => {
      try {
        const departmentsData = await fetchDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartmentsData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: budget?.id || Date.now().toString(),
      ...formData,
      department: formData.department_id.toString(),
      remaining: formData.budgetAmount - formData.spentAmount,
      remainingAmount: formData.budgetAmount - formData.spentAmount,
      percentage: formData.budgetAmount > 0 ? (formData.spentAmount / formData.budgetAmount) * 100 : 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department_id">Department</Label>
          <Select value={formData.department_id.toString()} onValueChange={(value) => setFormData({ ...formData, department_id: parseInt(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
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
            onChange={(e) => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, spentAmount: parseFloat(e.target.value) })}
            placeholder="0.00"
            step="0.01"
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
            onChange={(e) => setFormData({ ...formData, fiscal_year: parseInt(e.target.value) })}
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
