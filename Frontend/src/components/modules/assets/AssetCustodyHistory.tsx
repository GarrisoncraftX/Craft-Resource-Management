'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CustodyRecord, AssignmentRecord } from '@/types/asset';
import { Calendar, User, MapPin, FileText, Plus } from 'lucide-react';

interface AssetCustodyHistoryProps {
  assetId: number;
  assetName: string;
  custodyChain?: CustodyRecord[];
  assignmentHistory?: AssignmentRecord[];
  onAddCustody?: (record: CustodyRecord) => void;
  onAddAssignment?: (record: AssignmentRecord) => void;
}

export const AssetCustodyHistory: React.FC<AssetCustodyHistoryProps> = ({
  assetId,
  assetName,
  custodyChain = [],
  assignmentHistory = [],
  onAddCustody,
  onAddAssignment,
}) => {
  const [activeTab, setActiveTab] = useState<'custody' | 'assignment'>('custody');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    custodian: '',
    custodianType: 'employee' as const,
    condition: 'good',
    notes: '',
    assignedDate: new Date().toISOString().split('T')[0],
  });

  const handleAddRecord = () => {
    if (formData.custodian && activeTab === 'custody') {
      const newRecord: CustodyRecord = {
        id: `custody-${Date.now()}`,
        assetId,
        custodian: formData.custodian,
        custodianType: formData.custodianType,
        receivedDate: formData.assignedDate,
        condition: formData.condition,
        notes: formData.notes,
      };
      onAddCustody?.(newRecord);
      setFormData({
        custodian: '',
        custodianType: 'employee',
        condition: 'good',
        notes: '',
        assignedDate: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custody Chain Tab */}
      <Card>
        <CardHeader>
          <CardTitle>Custody Chain & Assignment History</CardTitle>
          <CardDescription>Track who holds this asset and when it was assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('custody')}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === 'custody'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Custody Chain ({custodyChain.length})
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`pb-3 px-4 font-medium text-sm ${
                activeTab === 'assignment'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Assignment History ({assignmentHistory.length})
            </button>
          </div>

          {activeTab === 'custody' && (
            <div className="space-y-4">
              {custodyChain.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No custody records yet</p>
              ) : (
                <div className="space-y-3">
                  {custodyChain.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{record.custodian}</span>
                            <Badge variant="secondary" className="text-xs">{record.custodianType}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.receivedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="text-gray-600">Condition: </span>
                            <Badge variant="outline" className="capitalize">{record.condition}</Badge>
                          </div>
                          {record.releasedDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <Calendar className="w-4 h-4" />
                              Released: {new Date(record.releasedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                            <p className="text-gray-700">{record.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custody Record
              </Button>

              {showAddForm && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custodian" className="text-sm">Custodian</Label>
                      <Input
                        id="custodian"
                        value={formData.custodian}
                        onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                        placeholder="Name or ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custodianType" className="text-sm">Type</Label>
                      <Select value={formData.custodianType} onValueChange={(value: any) => setFormData({ ...formData, custodianType: value })}>
                        <SelectTrigger id="custodianType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="department">Department</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receivedDate" className="text-sm">Received Date</Label>
                      <Input
                        id="receivedDate"
                        type="date"
                        value={formData.assignedDate}
                        onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-sm">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                        <SelectTrigger id="condition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes" className="text-sm">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about this custody transfer..."
                        className="min-h-20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddRecord} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      Save Record
                    </Button>
                    <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className="space-y-4">
              {assignmentHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assignment history yet</p>
              ) : (
                <div className="space-y-3">
                  {assignmentHistory.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{record.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Assigned: {new Date(record.assignedDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="text-gray-600">Assigned by: </span>
                            <span className="font-medium">{record.assignedBy}</span>
                          </div>
                          {record.unassignedDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <Calendar className="w-4 h-4" />
                              Unassigned: {new Date(record.unassignedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {record.reason && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
                          <strong>Reason:</strong> {record.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetCustodyHistory;
