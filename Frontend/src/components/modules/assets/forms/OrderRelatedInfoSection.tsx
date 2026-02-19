import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSuppliers } from '@/services/mockData/assets';

interface OrderRelatedData {
  orderNumber: string;
  purchaseDate: string;
  eolDate: string;
  supplier: string;
  purchaseCost: string;
  currency: string;
}

interface OrderRelatedInfoSectionProps {
  data: OrderRelatedData;
  onChange: (field: string, value: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const OrderRelatedInfoSection: React.FC<OrderRelatedInfoSectionProps> = ({ data, onChange, expanded, onToggle }) => {
  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-6 py-3 bg-gray-100 text-sm font-semibold text-gray-800 hover:bg-gray-200"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        Order Related Information
      </button>

      {expanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Order Number */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Order Number</label>
            <Input
              value={data.orderNumber}
              onChange={(e) => onChange('orderNumber', e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Purchase Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Purchase Date</label>
            <Input
              type="date"
              value={data.purchaseDate}
              onChange={(e) => onChange('purchaseDate', e.target.value)}
              className="w-56"
            />
          </div>

          {/* EOL Date */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">EOL Date</label>
            <Input
              type="date"
              value={data.eolDate}
              onChange={(e) => onChange('eolDate', e.target.value)}
              className="w-56"
            />
          </div>

          {/* Supplier */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Supplier</label>
            <div className="flex items-center gap-2 flex-1">
              <Select value={data.supplier} onValueChange={(value) => onChange('supplier', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="w-3 h-3 mr-1" /> New
              </Button>
            </div>
          </div>

          {/* Purchase Cost */}
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-bold text-gray-700 text-right shrink-0">Purchase Cost</label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-l border border-r-0 border-gray-200">
                {data.currency || 'USD'}
              </span>
              <Input
                type="number"
                value={data.purchaseCost}
                onChange={(e) => onChange('purchaseCost', e.target.value)}
                className="w-40 rounded-l-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
