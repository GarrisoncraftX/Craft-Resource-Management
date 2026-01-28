import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { LeaveType } from '@/types/nodejsbackendapi/leaveTypes';

interface LeavePoliciesProps {
  policies: LeaveType[];
  onSave: (policy: Partial<LeaveType>, isNew: boolean, id?: number) => void;
  onDelete: (id: number) => void;
}

export const LeavePolicies: React.FC<LeavePoliciesProps> = ({ policies, onSave, onDelete }) => {
  const [editingPolicy, setEditingPolicy] = useState<LeaveType | null>(null);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState<Partial<LeaveType>>({});

  const handleSave = () => {
    onSave(policyForm, isCreatingPolicy, editingPolicy?.id);
    setEditingPolicy(null);
    setIsCreatingPolicy(false);
    setPolicyForm({});
  };

  const handleClose = () => {
    setEditingPolicy(null);
    setIsCreatingPolicy(false);
    setPolicyForm({});
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setIsCreatingPolicy(true); setPolicyForm({}); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Leave Policy
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <CardTitle>{policy.name}</CardTitle>
              <CardDescription>{policy.description || 'Leave policy'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Max Days: {policy.maxDaysPerYear} days/year</p>
                <p className="text-sm">Carryover: {policy.carryForwardAllowed ? `${policy.maxCarryForwardDays} days` : 'Not allowed'}</p>
                <p className="text-sm">Requires Approval: {policy.requiresApproval ? 'Yes' : 'No'}</p>
                <p className="text-sm">Paid: {policy.isPaid ? 'Yes' : 'No'}</p>
                <p className="text-sm">Status: {policy.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" variant="outline" onClick={() => { setEditingPolicy(policy); setPolicyForm(policy); }}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(policy.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(editingPolicy || isCreatingPolicy) && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={handleClose}
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
          role="button"
          tabIndex={0}
          aria-label="Close dialog"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{isCreatingPolicy ? 'Create Leave Policy' : 'Edit Leave Policy'}</h2>
              <Button variant="ghost" size="sm" onClick={handleClose}>✕</Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Policy Name</Label>
                <Input value={policyForm.name || ''} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={policyForm.description || ''} onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Max Days Per Year</Label>
                <Input type="number" value={policyForm.maxDaysPerYear || 0} onChange={(e) => setPolicyForm({ ...policyForm, maxDaysPerYear: Number.parseInt(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={policyForm.carryForwardAllowed || false} onChange={(e) => setPolicyForm({ ...policyForm, carryForwardAllowed: e.target.checked })} />
                <Label>Allow Carry Forward</Label>
              </div>
              {policyForm.carryForwardAllowed && (
                <div>
                  <Label>Max Carry Forward Days</Label>
                  <Input type="number" value={policyForm.maxCarryForwardDays || 0} onChange={(e) => setPolicyForm({ ...policyForm, maxCarryForwardDays: Number.parseInt(e.target.value) })} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={policyForm.requiresApproval !== false} onChange={(e) => setPolicyForm({ ...policyForm, requiresApproval: e.target.checked })} />
                <Label>Requires Approval</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={policyForm.isPaid !== false} onChange={(e) => setPolicyForm({ ...policyForm, isPaid: e.target.checked })} />
                <Label>Paid Leave</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={policyForm.isActive !== false} onChange={(e) => setPolicyForm({ ...policyForm, isActive: e.target.checked })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSave}>Save</Button>
                <Button className="flex-1" variant="outline" onClick={handleClose}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
