import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, X, Columns3, Plus, RefreshCw, Download, Printer, Maximize2 } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  defaultVisible?: boolean;
}

interface AssetDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  onAdd?: () => void;
  addLabel?: string;
  rowsPerPageOptions?: number[];
  actions?: (row: T) => React.ReactNode;
}

export function getStatusBadge(status: string) {
  const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    'Active': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
    'Ready to Deploy': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
    'Deployable': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
    'Deployed': { variant: 'default', className: 'bg-sky-500 hover:bg-sky-600 text-white border-0' },
    'In Use': { variant: 'default', className: 'bg-sky-500 hover:bg-sky-600 text-white border-0' },
    'Maintenance': { variant: 'secondary', className: 'bg-amber-500 hover:bg-amber-600 text-white border-0' },
    'Pending': { variant: 'secondary', className: 'bg-amber-500 hover:bg-amber-600 text-white border-0' },
    'Archived': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white border-0' },
    'Disposed': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white border-0' },
    'Completed': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
    'Scheduled': { variant: 'secondary', className: 'bg-sky-500 hover:bg-sky-600 text-white border-0' },
    'In Progress': { variant: 'secondary', className: 'bg-amber-500 hover:bg-amber-600 text-white border-0' },
    'Cancelled': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white border-0' },
    'Approved': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' },
    'Rejected': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white border-0' },
  };

  const config = statusMap[status] || { variant: 'outline' as const, className: 'border-muted-foreground/30' };
  return (
    <Badge variant={config.variant} className={`text-xs font-medium px-2.5 py-0.5 ${config.className}`}>
      {status}
    </Badge>
  );
}

export function AssetDataTable<T extends { id?: number | string }>({
  data,
  columns,
  title,
  onAdd,
  addLabel = 'Create New',
  rowsPerPageOptions = [20, 50, 100],
  actions,
}: AssetDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.defaultVisible !== false).map(c => c.key))
  );
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor(row);
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const activeColumns = columns.filter(c => visibleColumns.has(c.key));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} rows
          <select
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="ml-2 inline-flex h-7 px-2 rounded border border-gray-300 bg-sky-500 text-white text-xs font-medium cursor-pointer"
          >
            {rowsPerPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="ml-1 text-xs">rows per page</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search"
              className="h-8 w-48 text-sm pr-8 border-gray-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600" onClick={() => setSearch('')}>
            <X className="h-3.5 w-3.5" />
          </Button>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0">
                <Columns3 className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map(col => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={visibleColumns.has(col.key)}
                  onCheckedChange={checked => {
                    const next = new Set(visibleColumns);
                    checked ? next.add(col.key) : next.delete(col.key);
                    setVisibleColumns(next);
                  }}
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAdd && (
            <Button size="sm" className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white border-0" onClick={onAdd}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0">
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              {activeColumns.map(col => (
                <TableHead key={col.key} className="text-xs font-semibold text-gray-700 whitespace-nowrap py-3 px-4">
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeColumns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground text-sm">
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow key={(row as any).id ?? idx} className="hover:bg-gray-50/50 border-b border-gray-100">
                  {activeColumns.map(col => (
                    <TableCell key={col.key} className="text-sm py-3 px-4 text-gray-700">
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer pagination info */}
      <div className="p-3 border-t border-gray-100 text-sm text-muted-foreground">
        Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} rows
      </div>
    </div>
  );
}
