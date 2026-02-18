import React, { useMemo, useState } from "react"
import { ChevronDown, X, Plus, Trash2, RefreshCw, FileText, Download, Printer, Maximize2, Search, Wrench, Clock4,  History } from "lucide-react"
import { ColumnDropdown } from './ColumnDropdown'


export default function AssetsToolbar({
  totalRows = 401,
  pageSizeOptions = [10, 20, 50, 100],
  totalPages = 21,
  initialPage = 1,
  initialPageSize = 20,

  // Optional callbacks
  onBulkGo,
  onSearchChange,
  onAction,
  onPageChange,
  onPageSizeChange,
  
  // Column mapping
  allColumns = [],
  visibleColumns = new Set(),
  onColumnToggle,
  onToggleAll,
  
  // Pagination control
  showPagination = true,
  
  // View type
  viewType = 'assets',
}) {
  const [bulkAction, setBulkAction] = useState("Bulk Edit")
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [page, setPage] = useState(initialPage)

  // Sync with parent state
  React.useEffect(() => {
    setPage(initialPage)
  }, [initialPage])

  React.useEffect(() => {
    setPageSize(initialPageSize)
  }, [initialPageSize])

  const showingFrom = useMemo(() => (page - 1) * pageSize + 1, [page, pageSize])
  const showingTo = useMemo(
    () => Math.min(page * pageSize, totalRows),
    [page, pageSize, totalRows]
  )

  const pages = useMemo(() => {
    // 1 2 3 4 5 … last (like screenshot)
    const out = []
    ;[1, 2, 3, 4, 5].forEach((p) => p <= totalPages && out.push(p))
    if (totalPages > 6) out.push("…")
    if (totalPages > 5) out.push(totalPages)
    return out
  }, [totalPages])

  const setPageSafe = (p) => {
    const next = Math.max(1, Math.min(totalPages, p))
    setPage(next)
    onPageChange?.(next)
  }

  const setPageSizeSafe = (ps) => {
    setPageSize(ps)
    onPageSizeChange?.(ps)
    setPageSafe(1)
  }

  const clearSearch = () => {
    setQuery("")
    onSearchChange?.("")
  }

  return (
    <div className="w-full bg-white p-4">
      <div className="border-t border-slate-200">
        {/* TOP ROW */}
        <div className="p-2 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 border-b border-gray-100">
          {/* Bulk Edit + Go */}
          {(viewType === 'assets' || viewType === 'people') && (
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-[300px]">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="h-8 w-full appearance-none rounded-sm border border-slate-300 bg-white px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option>Bulk Edit</option>
                  {viewType === 'assets' && (
                    <>
                      <option>Add Maintenance</option>
                      <option>Bulk Checkout</option>
                      <option>Bulk Delete</option>
                      <option>Generate Labels</option>
                    </>
                  )}
                  {viewType === 'people' && (
                    <>
                      <option>Email List of All Assigned</option>
                      <option>Bulk Checkin/Delete Users</option>
                      <option>Merge Users</option>
                      <option>Print All Assigned</option>
                    </>
                  )}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={() => onBulkGo?.(bulkAction)}
                className="h-8 rounded-md border border-slate-300 bg-sky-100 px-5 font-semibold text-slate-800 hover:bg-sky-200 active:scale-[0.99]"
              >
                Go
              </button>
            </div>
          )}

          {/* Search + clear */}
          <div className="flex">
            <div className="flex h-8 w-full max-w-[520px] overflow-hidden rounded-md border border-slate-300 bg-white">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  onSearchChange?.(e.target.value)
                }}
                placeholder="Search"
                className="h-full w-full px-4 text-sm outline-none"
              />
              <button
                type="button"
                onClick={clearSearch}
                title="Clear search"
                className="flex h-full w-12 items-center justify-center bg-sky-700 text-white hover:bg-sky-800"
              >
                <X size={12} />
              </button>
            </div>

          {/* Action buttons */}
          <div>
            <div className="inline-flex overflow-hidden rounded-md border border-sky-800">
              {/* view dropdown */}
              <ColumnDropdown
                allColumns={allColumns}
                visibleColumns={visibleColumns}
                onColumnToggle={onColumnToggle}
                onToggleAll={onToggleAll}
              />

              <IconBtn
                title="Create New"
                onClick={() => onAction?.("add")}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Plus size={12} />
              </IconBtn>

              {viewType === 'licenses' && (
                <>
                 <IconBtn
                  title="Expiring or Terminating Soon"
                  onClick={() => onAction?.("expiring")}
                  className="bg-sky-700 hover:bg-sky-800"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <Clock4 cx="12" cy="12" r="10" fill="white"/>
                    <path d="M12 6v6l4 2" stroke="#0369a1" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </IconBtn>
                  <IconBtn
                    title="Expired or Terminated"
                    onClick={() => onAction?.("expired")}
                    className="bg-sky-700 hover:bg-sky-800"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <History cx="12" cy="12" r="10" fill="#0369a1"/>
                      <path stroke="white"/>
                    </svg>
                  </IconBtn>
                </>
              )}

              {viewType === 'assets' && (
                <IconBtn
                  title="Delete"
                  onClick={() => onAction?.("delete")}
                  className="bg-sky-700 hover:bg-sky-800"
                >
                  <Trash2 size={12} />
                </IconBtn>
              )}

              <IconBtn
                title="Refresh"
                onClick={() => onAction?.("refresh")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <RefreshCw size={12} />
              </IconBtn>

              <IconBtn
                title="CSV"
                onClick={() => onAction?.("csv")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <FileText size={12} />
              </IconBtn>

              <IconBtn
                title="Download"
                onClick={() => onAction?.("download")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <Download size={12} />
                <ChevronDown size={12} className="ml-1" />
              </IconBtn>

              <IconBtn
                title="Print"
                onClick={() => onAction?.("print")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <Printer size={12} />
              </IconBtn>

              <IconBtn
                title="Fullscreen"
                onClick={() => onAction?.("fullscreen")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <Maximize2 size={12} />
              </IconBtn>

              <IconBtn
                title="Advance Search"
                onClick={() => onAction?.("search")}
                className="bg-sky-700 hover:bg-sky-800"
              >
                <Search size={12} />
              </IconBtn>

              {viewType === 'assets' && (
                <IconBtn
                  title="Add Maintenance"
                  onClick={() => onAction?.("maintenance")}
                  className="bg-sky-700 hover:bg-sky-800"
                >
                  <Wrench size={12} />
                </IconBtn>
              )}
            </div>
          </div>
        </div>
    </div>


        {/* BOTTOM ROW */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Showing + rows-per-page */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-800">
            <span>
              Showing {showingFrom} to {showingTo} of {totalRows} rows
            </span>

            {showPagination && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSizeSafe(Number(e.target.value))}
                    className="h-8 w-[72px] appearance-none rounded-md border border-sky-800 bg-sky-700 px-4 pr-8 font-bold text-white outline-none hover:bg-sky-800"
                  >
                    {pageSizeOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white"
                  />
                </div>
                <span className="text-xs">rows per page</span>
              </div>
            )}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="inline-flex overflow-hidden rounded-md">
              <PageBtn
                onClick={() => setPageSafe(page - 1)}
                disabled={page === 1}
                className="rounded-l-md"
              >
                Previous
              </PageBtn>

              {pages.map((p, idx) =>
                p === "…" ? (
                  <div
                    key={`dots-${idx}`}
                    className="flex h-8 items-center justify-center border-y border-sky-800 bg-sky-700 px-4 text-xs font-semibold text-white"
                  >
                    …
                  </div>
                ) : (
                  <PageBtn
                    key={p}
                    onClick={() => setPageSafe(p)}
                    active={p === page}
                    className="rounded-none"
                  >
                    {p}
                  </PageBtn>
                )
              )}

              <PageBtn
                onClick={() => setPageSafe(page + 1)}
                disabled={page === totalPages}
                className="rounded-r-md"
              >
                Next
              </PageBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function IconBtn({ children, className = "", onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "inline-flex h-8 min-w-12 items-center justify-center px-4 text-white",
        "border-r border-sky-800 last:border-r-0",
        "active:scale-[0.99]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function PageBtn({ children, onClick, disabled, active, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-8 px-5 text-xs font-semibold",
        "border border-sky-800 -ml-px first:ml-0",
        active
          ? "bg-white text-slate-800"
          : "bg-sky-700 text-white hover:bg-sky-800",
        disabled ? "cursor-not-allowed opacity-60 hover:bg-sky-700" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  )
}
