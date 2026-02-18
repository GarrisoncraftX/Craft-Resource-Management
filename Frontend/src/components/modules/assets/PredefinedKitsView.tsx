import React from 'react';
import { Button } from '@/components/ui/button';
import { AssetDataTable, ColumnDef } from './AssetDataTable';
import { Pencil, Trash2 } from 'lucide-react';

interface PredefinedKit {
  id: number;
  name: string;
  checkinCheckout: string;
}

const mockPredefinedKits: PredefinedKit[] = [];

const columns: ColumnDef<PredefinedKit>[] = [
  { key: 'name', header: 'Name', accessor: (r) => <span className="text-sky-600 font-medium hover:underline cursor-pointer">{r.name}</span> },
  { key: 'checkinCheckout', header: 'Checkin/Checkout', accessor: (r) => r.checkinCheckout },
];

export const PredefinedKitsView: React.FC = () => {
  return (
    <div className="space-y-4 bg-card p-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-sky-600 cursor-pointer hover:underline">🏠</span>
        <span className="font-bold text-2xl text-foreground">Predefined Kits</span>
      </div>


      <AssetDataTable
        data={mockPredefinedKits}
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
