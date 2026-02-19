import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from '../AssetDataTable';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CustomField } from '@/types/javabackendapi/assetTypes';
import { mockCustomFields } from '@/services/mockData/assets';


const columns: ColumnDef<CustomField>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'helpText', header: 'Help Text', accessor: (r) => r.helpText },
  { key: 'format', header: 'Format', accessor: (r) => r.format },
  { key: 'isSortable', header: '🔀', accessor: (r) => r.isSortable ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'isSearchable', header: '🔍', accessor: (r) => r.isSearchable ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'isFilterable', header: '⊕', accessor: (r) => r.isFilterable ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'isRequired', header: '✓', accessor: (r) => r.isRequired ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'isListColumn', header: '□', accessor: (r) => r.isListColumn ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-500" /> },
  { key: 'element', header: 'Element', accessor: (r) => r.element },
  { key: 'fieldsets', header: 'Fieldsets', accessor: (r) => (
    <div className="flex flex-wrap gap-1">
      {r.fieldsets.map(fs => (
        <Badge key={fs} className="bg-sky-500 text-white text-xs px-2 py-0.5">{fs}</Badge>
      ))}
    </div>
  ) },
];

export const CustomFieldsView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Custom Fields</span>
      </div>


      <AssetDataTable
        data={mockCustomFields}
        columns={columns}
        onAdd={() => {}}
        actions={(row) => (
          <>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-amber-400 hover:bg-amber-500 text-white rounded">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-red-400 hover:bg-red-500 text-white rounded">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      />
    </div>
  );
};
