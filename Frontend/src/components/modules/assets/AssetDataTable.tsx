import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AssetsToolbar from './AssetToolbar';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  defaultVisible?: boolean;
  sticky?: 'left' | 'right';
}

interface AssetDataTableProps<T> {
  readonly data: T[];
  readonly columns: ColumnDef<T>[];
  readonly rowsPerPageOptions?: number[];
  readonly actions?: (row: T) => React.ReactNode;
  readonly showCheckboxHeader?: boolean;
  readonly checkboxHeaderContent?: React.ReactNode;
  readonly viewType?: 'assets' | 'licenses' | 'accessories' | 'components' | 'consumables' | 'kits' | 'people' | 'settings';
  readonly onBulkGo?: (action: string) => void;
  readonly onAction?: (action: string) => void;
  readonly selectedCount?: number;
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
  rowsPerPageOptions = [20, 50, 100],
  actions,
  showCheckboxHeader = false,
  checkboxHeaderContent,
  viewType = 'assets',
  onBulkGo,
  onAction,
  selectedCount = 0,
}: AssetDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.defaultVisible !== false).map(c => c.key))
  );
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = col.accessor(row);
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [data, search, columns]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const activeColumns = columns.filter(c => visibleColumns.has(c.key) && c.key !== 'checkbox' && c.sticky !== 'right');
  const checkboxColumn = columns.find(c => c.key === 'checkbox');
  const stickyRightColumns = columns.filter(c => visibleColumns.has(c.key) && c.sticky === 'right');

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    const allChecked = columns.every(c => visibleColumns.has(c.key));
    if (allChecked) {
      setVisibleColumns(new Set());
    } else {
      setVisibleColumns(new Set(columns.map(c => c.key)));
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setRowsPerPage(size);
    setCurrentPage(1);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortColumn(null);
    } else {
      setSortColumn(columnKey);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Toolbar */}
    <AssetsToolbar
      allColumns={columns.map(c => ({ key: c.key, header: c.header }))}
      visibleColumns={visibleColumns}
      onColumnToggle={toggleColumn}
      onToggleAll={toggleAll}
      totalRows={filteredData.length}
      totalPages={totalPages}
      initialPage={currentPage}
      initialPageSize={rowsPerPage}
      pageSizeOptions={rowsPerPageOptions}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={setSearch}
      showPagination={filteredData.length > 19}
      viewType={viewType}
      onBulkGo={onBulkGo}
      onAction={onAction}
      selectedCount={selectedCount}
    />

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b-2 border-gray-300">
              {showCheckboxHeader && checkboxColumn && (
                <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap py-3 px-4 w-12">
                  {checkboxHeaderContent}
                </TableHead>
              )}
              {activeColumns.map((col, idx) => (
                <TableHead 
                  key={col.key} 
                  className="text-xs font-semibold text-gray-700 whitespace-nowrap py-3 px-4 border-r border-gray-300 last:border-r-0"
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex flex-col hover:bg-gray-200 rounded px-1"
                      >
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </TableHead>
              ))}
              {stickyRightColumns.map(col => (
                <TableHead key={col.key} className="text-xs font-semibold text-gray-700 whitespace-nowrap py-3 px-4 border-r border-gray-300 sticky right-[80px] bg-gray-100 z-10">
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4 sticky right-0 bg-gray-100 z-10">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeColumns.length + stickyRightColumns.length + (showCheckboxHeader && checkboxColumn ? 1 : 0) + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground text-sm">
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow key={(row).id ?? idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                  {showCheckboxHeader && checkboxColumn && (
                    <TableCell className="text-sm py-3 px-4 text-gray-700">
                      {checkboxColumn.accessor(row)}
                    </TableCell>
                  )}
                  {activeColumns.map(col => (
                    <TableCell key={col.key} className="text-sm py-3 px-4 text-gray-700 border-r border-gray-200 last:border-r-0">
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  {stickyRightColumns.map(col => (
                    <TableCell key={col.key} className="text-sm py-3 px-4 text-gray-700 bg-red-500 hover:bg-red-600 border-r border-gray-200 sticky right-[80px] z-10" style={{ backgroundColor: idx % 2 === 0 ? 'rgb(251, 250, 249)' : 'white' }}>
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="py-3 px-4 sticky right-0 z-10" style={{ backgroundColor: idx % 2 === 0 ? 'rgb(249 250 251)' : 'white' }}>
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
