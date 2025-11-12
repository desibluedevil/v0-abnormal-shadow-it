"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronRight, FolderSearch, Sparkles } from "lucide-react"
import type { ShadowApp } from "@/types/shadow-it"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Column {
  id: string
  header: string | (() => React.ReactNode)
  accessor?: keyof ShadowApp | ((row: ShadowApp) => any)
  cell: (row: ShadowApp) => React.ReactNode
  size?: number
  sortable?: boolean
  sortingFn?: (a: ShadowApp, b: ShadowApp) => number
  className?: string
  hideOnMobile?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: ShadowApp[]
  focusId?: string
  changedRowIds?: Set<string>
  selectedRowIds?: Set<string>
  onSelectedRowsChange?: (selectedIds: Set<string>) => void
}

const MemoizedDataTableRow = memo(function DataTableRow({
  row,
  columns,
  isFocused,
  isKeyboardFocused,
  focusRowRef,
  changedRowIds,
  expandedRows,
  onRowClick,
  onToggleExpansion,
  isSelected,
  onSelectChange,
}: {
  row: ShadowApp
  columns: Column[]
  isFocused: boolean
  isKeyboardFocused: boolean
  focusRowRef: React.RefObject<HTMLTableRowElement> | null
  changedRowIds: Set<string>
  expandedRows: Set<string>
  onRowClick: (appId: string, e: React.MouseEvent) => void
  onToggleExpansion: (rowId: string) => void
  isSelected: boolean
  onSelectChange: (checked: boolean) => void
}) {
  if (!row || !row.id) {
    return null
  }

  const isRevoked = row.status === "Revoked"
  const isChanged = changedRowIds.has(row.id)
  const isExpanded = expandedRows.has(row.id)

  return (
    <>
      <TableRow
        ref={isFocused ? focusRowRef : null}
        onClick={(e) => onRowClick(row.id, e)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onToggleExpansion(row.id)
          }
        }}
        tabIndex={0}
        className={`h-14 hover:bg-muted/50 hover:shadow-[0_4px_12px_rgba(71,215,255,0.15)] hover:translate-y-[-2px] transition-all duration-200 cursor-pointer ${
          isFocused ? "ring-2 ring-[#47D7FF] ring-inset bg-[#47D7FF]/10" : ""
        } ${isKeyboardFocused ? "ring-2 ring-[#47D7FF] ring-inset" : ""} ${
          isRevoked ? "text-muted-foreground opacity-60" : ""
        } ${isChanged ? "animate-pulse bg-[#39D98A]/10" : ""} ${isSelected ? "bg-[#47D7FF]/5" : ""}`}
        role="button"
        aria-label={`${row.name} - ${row.riskLevel} risk. Press Enter to expand details`}
        aria-expanded={isExpanded}
      >
        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            aria-label={`Select ${row.name}`}
            className="data-[state=checked]:bg-[#47D7FF] data-[state=checked]:border-[#47D7FF]"
          />
        </TableCell>
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpansion(row.id)
            }}
            aria-label={isExpanded ? "Collapse row" : "Expand row"}
            aria-expanded={isExpanded}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 text-[#47D7FF]" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            className={`px-3 py-2 text-sm ${column.className || ""} ${
              column.id === "actions" ? "sticky right-0 bg-card shadow-[-4px_0_8px_rgba(0,0,0,0.1)]" : ""
            }`}
            style={{
              width: column.size ? `${column.size}px` : undefined,
              minWidth: column.size ? `${column.size}px` : undefined,
            }}
          >
            {column.cell(row)}
          </TableCell>
        ))}
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-[#12171C] border-t border-[#47D7FF]/20">
          <TableCell colSpan={columns.length + 2} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="lg:hidden space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Publisher
                  </div>
                  <div className="text-sm text-foreground">{row.publisher}</div>
                </div>
              </div>

              <div className="md:hidden space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Users</div>
                  <div className="text-sm font-mono text-foreground">{row.users.length}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status</div>
                  <div className="text-sm">
                    <Badge variant="outline" className={getStatusBadgeClass(row.status)}>
                      {row.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="lg:hidden space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    First Seen
                  </div>
                  <div className="text-sm font-mono text-foreground">{formatDate(row.firstSeen)}</div>
                </div>
              </div>
              <div className="xl:hidden space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Last Seen
                  </div>
                  <div className="text-sm font-mono text-foreground">{formatDate(row.lastSeen)}</div>
                </div>
              </div>
              <div className="xl:hidden space-y-3">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {row.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3 border-t border-border pt-3 mt-2">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Scopes ({row.scopes.length})
                  </div>
                  <div className="space-y-1">
                    {row.scopes.slice(0, 5).map((scope) => (
                      <div key={scope.name} className="text-xs">
                        <span className="font-mono text-[#47D7FF]">{scope.name}</span>
                        <span className="text-muted-foreground ml-2">- {scope.description}</span>
                      </div>
                    ))}
                    {row.scopes.length > 5 && (
                      <div className="text-xs text-muted-foreground">+ {row.scopes.length - 5} more scopes</div>
                    )}
                  </div>
                </div>
              </div>

              {row.aiExplanation && (
                <div className="md:col-span-2 space-y-3 border-t border-border pt-3 mt-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-[#47D7FF]" />
                      <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        AI Explanation
                      </div>
                    </div>
                    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-gradient-to-br from-[#47D7FF]/5 to-[#47D7FF]/10 p-4 rounded-lg border border-[#47D7FF]/20">
                      {row.aiExplanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getStatusBadgeClass(status: ShadowApp["status"]) {
  const colors = {
    Unsanctioned: "bg-muted text-muted-foreground border-border",
    Sanctioned: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    Revoked: "bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/30",
    Dismissed: "bg-muted/50 text-muted-foreground/70 border-border/50",
  }
  return colors[status]
}

export function DataTable({
  columns,
  data,
  focusId,
  changedRowIds = new Set(),
  selectedRowIds = new Set(),
  onSelectedRowsChange,
}: DataTableProps) {
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" } | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1)

  const focusRowRef = useRef<HTMLTableRowElement>(null)
  const tableBodyRef = useRef<HTMLTableSectionElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (focusId && focusRowRef.current) {
      focusRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [focusId])

  const validData = useMemo(() => {
    return data.filter((row) => row && row.id && row.status)
  }, [data])

  const sortedData = useMemo(() => {
    if (!sorting) return validData

    const column = columns.find((c) => c.id === sorting.column)
    if (!column) return validData

    return [...validData].sort((a, b) => {
      let compareResult = 0

      if (column.sortingFn) {
        compareResult = column.sortingFn(a, b)
      } else if (column.accessor) {
        const aVal = typeof column.accessor === "function" ? column.accessor(a) : a[column.accessor]
        const bVal = typeof column.accessor === "function" ? column.accessor(b) : b[column.accessor]

        if (typeof aVal === "string" && typeof bVal === "string") {
          compareResult = aVal.localeCompare(bVal)
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          compareResult = aVal - bVal
        } else {
          compareResult = String(aVal).localeCompare(String(bVal))
        }
      }

      return sorting.direction === "asc" ? compareResult : -compareResult
    })
  }, [validData, sorting, columns])

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pageIndex, pageSize])

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectedRowsChange) return

    if (checked) {
      // Select all rows on current page
      const allIds = new Set(selectedRowIds)
      paginatedData.forEach((row) => allIds.add(row.id))
      onSelectedRowsChange(allIds)
    } else {
      // Deselect all rows on current page
      const remainingIds = new Set(selectedRowIds)
      paginatedData.forEach((row) => remainingIds.delete(row.id))
      onSelectedRowsChange(remainingIds)
    }
  }

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectedRowsChange) return

    const newSelected = new Set(selectedRowIds)
    if (checked) {
      newSelected.add(rowId)
    } else {
      newSelected.delete(rowId)
    }
    onSelectedRowsChange(newSelected)
  }

  const allCurrentPageSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRowIds.has(row.id))
  const someCurrentPageSelected = paginatedData.some((row) => selectedRowIds.has(row.id)) && !allCurrentPageSelected

  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    if (!column || column.sortable === false) return

    setSorting((prev) => {
      if (prev?.column === columnId) {
        return prev.direction === "asc" ? { column: columnId, direction: "desc" } : null
      }
      return { column: columnId, direction: "asc" }
    })
  }

  const handleRowClick = (appId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a") || target.closest('[role="button"]')) {
      return
    }

    router.push(`/inventory?focus=${appId}`)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInTable = tableBodyRef.current?.contains(target)

      if (!isInTable) return

      const maxIndex = paginatedData.length - 1

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedRowIndex((prev) => {
            const next = Math.min(prev + 1, maxIndex)
            setTimeout(() => {
              const rows = tableBodyRef.current?.querySelectorAll('tr[role="button"]')
              if (rows?.[next]) {
                ;(rows[next] as HTMLElement).focus()
              }
            }, 0)
            return next
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedRowIndex((prev) => {
            const next = Math.max(prev - 1, 0)
            setTimeout(() => {
              const rows = tableBodyRef.current?.querySelectorAll('tr[role="button"]')
              if (rows?.[next]) {
                ;(rows[next] as HTMLElement).focus()
              }
            }, 0)
            return next
          })
          break
        case "Enter":
          e.preventDefault()
          if (focusedRowIndex >= 0 && focusedRowIndex <= maxIndex) {
            const row = paginatedData[focusedRowIndex]
            toggleRowExpansion(row.id)
          }
          break
        case "Escape":
          e.preventDefault()
          setFocusedRowIndex(-1)
          setExpandedRows(new Set())
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusedRowIndex, paginatedData])

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    indeterminate={someCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows on this page"
                    className="data-[state=checked]:bg-[#47D7FF] data-[state=checked]:border-[#47D7FF]"
                  />
                </TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Expand</span>
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{
                      width: column.size ? `${column.size}px` : undefined,
                      minWidth: column.size ? `${column.size}px` : undefined,
                    }}
                    className={`h-11 px-3 text-xs font-semibold text-foreground uppercase tracking-wide whitespace-nowrap ${column.className || ""} ${
                      column.id === "actions" ? "sticky right-0 bg-card shadow-[-4px_0_8px_rgba(0,0,0,0.1)]" : ""
                    }`}
                  >
                    <div
                      className={
                        column.sortable !== false
                          ? "cursor-pointer select-none flex items-center gap-2 hover:text-[#47D7FF] transition-colors"
                          : ""
                      }
                      onClick={() => column.sortable !== false && handleSort(column.id)}
                    >
                      {typeof column.header === "function" ? column.header() : column.header}
                      {sorting && sorting.column === column.id && (sorting.direction === "asc" ? " ↑" : " ↓")}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody ref={tableBodyRef}>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const isFocused = focusId === row.id
                  const isKeyboardFocused = focusedRowIndex === index
                  const isSelected = selectedRowIds.has(row.id)
                  return (
                    <MemoizedDataTableRow
                      key={row.id}
                      row={row}
                      columns={columns}
                      isFocused={isFocused}
                      isKeyboardFocused={isKeyboardFocused}
                      focusRowRef={isFocused ? focusRowRef : null}
                      changedRowIds={changedRowIds}
                      expandedRows={expandedRows}
                      onRowClick={handleRowClick}
                      onToggleExpansion={toggleRowExpansion}
                      isSelected={isSelected}
                      onSelectChange={(checked) => handleSelectRow(row.id, checked)}
                    />
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="h-48">
                    <Empty className="border-0 bg-transparent">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FolderSearch className="w-6 h-6" />
                        </EmptyMedia>
                        <EmptyTitle>No apps found</EmptyTitle>
                        <EmptyDescription>Try adjusting your filters or search query</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page:</p>
          <Select value={`${pageSize}`} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground font-mono">
            Page {pageIndex + 1} of {Math.ceil(sortedData.length / pageSize) || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev - 1)}
              disabled={pageIndex === 0}
              className="focus:ring-2 focus:ring-[#47D7FF]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={pageIndex >= Math.ceil(sortedData.length / pageSize) - 1}
              className="focus:ring-2 focus:ring-[#47D7FF]"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">↑</kbd>
        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono ml-1">↓</kbd>
        <span className="ml-2">Navigate rows</span>
        <span className="mx-2">•</span>
        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd>
        <span className="ml-2">Expand row</span>
        <span className="mx-2">•</span>
        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
        <span className="ml-2">Clear focus</span>
      </div>
    </div>
  )
}
