import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface OptionalInfoData {
  assetName: string;
  warranty: string;
  expectedCheckinDate: string;
  nextAuditDate: string;
  byod: boolean | number;
}

interface OptionalInfoSectionProps {
  data: OptionalInfoData;
  onChange: (field: string, value: string | boolean) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const OptionalInfoSection: React.FC<OptionalInfoSectionProps> = ({ data, onChange, expanded, onToggle }) => {
  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-6 py-3 bg-gray-100 text-sm font-semibold text-gray-800 hover:bg-gray-200"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        Optional Information
      </button>

      {expanded && (
        <div className="px-3 sm:px-6 py-4 space-y-4">
          {/* Asset Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="sm:w-40 text-sm font-bold text-gray-700 sm:text-right shrink-0">Asset Name</label>
            <Input
              value={data.assetName}
              onChange={(e) => onChange('assetName', e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Warranty */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="sm:w-40 text-sm font-bold text-gray-700 sm:text-right shrink-0">Warranty</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={data.warranty}
                onChange={(e) => onChange('warranty', e.target.value)}
                className="w-24"
                placeholder="0"
              />
              <span className="text-sm text-gray-500 px-3 py-2 bg-gray-100 rounded border border-gray-200">months</span>
            </div>
          </div>

          {/* Expected Checkin Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="sm:w-40 text-sm font-bold text-gray-700 sm:text-right shrink-0">Expected Checkin Date</label>
            <Input
              type="date"
              value={data.expectedCheckinDate}
              onChange={(e) => onChange('expectedCheckinDate', e.target.value)}
              className="w-full sm:w-56"
              placeholder="Select Date (YYYY-MM-DD)"
            />
          </div>

          {/* Next Audit Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="sm:w-40 text-sm font-bold text-gray-700 sm:text-right shrink-0">Next Audit Date</label>
            <div className="space-y-1">
              <Input
                type="date"
                value={data.nextAuditDate}
                onChange={(e) => onChange('nextAuditDate', e.target.value)}
                className="w-full sm:w-56"
                placeholder="Select Date (YYYY-MM-DD)"
              />
              <p className="text-xs text-sky-600">
                If you use auditing in your organization, this is usually automatically calculated based on the asset's last audit date and audit frequency (in <span className="font-mono text-pink-600">Admin Settings &gt; Alerts</span>) and you can leave this blank.
              </p>
            </div>
          </div>

          {/* BYOD */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:block w-40 shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="byod"
                  checked={data.byod}
                  onCheckedChange={(checked) => onChange('byod', checked as boolean)}
                />
                <label htmlFor="byod" className="text-sm text-gray-700 cursor-pointer">BYOD</label>
              </div>
              <p className="text-xs text-gray-500">This device is owned by the user</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
