'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle, Clock, Archive, X } from 'lucide-react';

interface AuditItem {
  id: string;
  assetTag: string;
  assetName: string;
  location: string;
  status: 'found' | 'missing' | 'discrepancy' | 'pending';
  condition: string;
  notes: string;
  auditDate: string;
}

interface AssetAuditChecklistProps {
  auditId?: string;
  auditDate?: string;
  items?: AuditItem[];
  onItemUpdate?: (item: AuditItem) => void;
  onAuditComplete?: () => void;
}

export const AssetAuditChecklist: React.FC<AssetAuditChecklistProps> = ({
  auditId,
  auditDate = new Date().toISOString().split('T')[0],
  items = [],
  onItemUpdate,
  onAuditComplete,
}) => {
  const [filter, setFilter] = useState<'all' | 'found' | 'missing' | 'discrepancy'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const found = items.filter((i) => i.status === 'found').length;
  const missing = items.filter((i) => i.status === 'missing').length;
  const discrepancies = items.filter((i) => i.status === 'discrepancy').length;
  const completionRate = Math.round(((found + missing + discrepancies) / items.length) * 100) || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'missing':
        return <X className="w-5 h-5 text-red-600" />;
      case 'discrepancy':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'found':
        return <Badge className="bg-emerald-100 text-emerald-800">Found</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
      case 'discrepancy':
        return <Badge className="bg-amber-100 text-amber-800">Discrepancy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Physical Inventory Audit</CardTitle>
              <CardDescription>Audit Date: {new Date(auditDate).toLocaleDateString()}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-emerald-600 font-semibold text-2xl">{found}</div>
              <p className="text-sm text-gray-600">Found</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-red-600 font-semibold text-2xl">{missing}</div>
              <p className="text-sm text-gray-600">Missing</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-amber-600 font-semibold text-2xl">{discrepancies}</div>
              <p className="text-sm text-gray-600">Discrepancies</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-blue-600 font-semibold text-2xl">{items.length}</div>
              <p className="text-sm text-gray-600">Total Assets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'found', 'missing', 'discrepancy'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-3 px-4 font-medium text-sm capitalize transition-colors ${
              filter === status
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Audit Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No {filter !== 'all' ? filter : 'audit'} items to display</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">{item.assetName}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-500">Asset Tag: </span>
                      <span className="font-mono font-medium">{item.assetTag}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location: </span>
                      <span className="font-medium">{item.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Condition: </span>
                      <span className="font-medium capitalize">{item.condition}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  {expandedItem === item.id ? '▼' : '▶'}
                </Button>
              </div>

              {expandedItem === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Audit Notes</label>
                    <Textarea
                      value={itemNotes[item.id] || item.notes || ''}
                      onChange={(e) => {
                        setItemNotes({ ...itemNotes, [item.id]: e.target.value });
                        onItemUpdate?.({
                          ...item,
                          notes: e.target.value,
                        });
                      }}
                      placeholder="Document any discrepancies, condition issues, or additional observations..."
                      className="min-h-20 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        onItemUpdate?.({ ...item, status: 'found' });
                      }}
                    >
                      Mark as Found
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        onItemUpdate?.({ ...item, status: 'missing' });
                      }}
                    >
                      Mark as Missing
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => {
                        onItemUpdate?.({ ...item, status: 'discrepancy' });
                      }}
                    >
                      Mark Discrepancy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Complete Audit Button */}
      {completionRate === 100 && (
        <Button
          onClick={onAuditComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Complete Audit
        </Button>
      )}
    </div>
  );
};

export default AssetAuditChecklist;
