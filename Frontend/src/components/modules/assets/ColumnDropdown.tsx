import React, { useState } from 'react';
import { LayoutGrid, ChevronDown, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface ColumnDropdownProps {
  allColumns: Array<{ key: string; header: string }>;
  visibleColumns: Set<string>;
  onColumnToggle: (key: string) => void;
  onToggleAll: () => void;
}

export function ColumnDropdown({ allColumns, visibleColumns, onColumnToggle, onToggleAll }: ColumnDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColumns = allColumns.filter(col =>
    col.header.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allChecked = allColumns.every(col => visibleColumns.has(col.key));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Columns"
          className="inline-flex h-8 min-w-12 items-center justify-center px-4 text-white border-r border-sky-800 last:border-r-0 active:scale-[0.99] bg-sky-700 hover:bg-sky-800"
        >
          <LayoutGrid size={12} />
          <ChevronDown size={12} className="ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-hidden flex flex-col">
        <div className="p-2 sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="overflow-y-auto">
          <DropdownMenuCheckboxItem
            checked={allChecked}
            onCheckedChange={onToggleAll}
            className="font-semibold"
          >
            Toggle all
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {filteredColumns.map((col) => (
            <DropdownMenuCheckboxItem
              key={col.key}
              checked={visibleColumns.has(col.key)}
              onCheckedChange={() => onColumnToggle(col.key)}
            >
              {col.header}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
