"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronRight, FolderSearch } from "lucide-react"
import type { ShadowApp } from "@/types/shadow-it"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface Column {
  id: string
  header: string | (() => React.ReactNode)
  accessor?: keyof ShadowApp | ((row: ShadowApp) => any)
  cell: (row: ShadowApp) => React.ReactNode
  size?: number
  sortable?: boolean
  sortingFn?: (a: ShadowApp, b: ShadowApp) => number
  className?: string
}

interface DataTableProps {
  columns: Column[]
  data: ShadowApp[]
  focusId?: string
  changedRowIds?: Set<string>
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
        tabIndex={0}
        className={`h-12 hover:bg-muted/50 hover:shadow-[0_2px_8px_rgba(71,215,255,0.15)] transition-all duration-200 cursor-pointer ${
          isFocused ? "ring-2 ring-[#47D7FF] ring-inset bg-[#47D7FF]/10" : ""
        } ${isKeyboardFocused ? "ring-2 ring-[#47D7FF] ring-inset" : ""} ${
          isRevoked ? "text-muted-foreground" : ""
        } ${isChanged ? "animate-pulse bg-[#39D98A]/10" : ""}`}
      >
        <TableCell className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpansion(row.id)
            }}
            aria-label={isExpanded ? "Collapse row" : "Expand row"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 text-[#47D7FF]" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            className={`px-3 py-2 text-sm whitespace-nowrap ${column.className || ""}`}
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
        <TableRow className="md:hidden bg-muted/30">
          <TableCell colSpan={columns.length + 1} className="p-4">
            <div className="space-y-2">
              {getRowDetails(row).map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{detail.label}:</span>
                  <span className="text-foreground">{detail.value}</span>
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
})

function getRowDetails(row: ShadowApp) {
  return [
    { label: "Publisher", value: row.publisher },
    { label: "Users", value: row.users.length.toString() },
    { label: "First Seen", value: new Date(row.firstSeen).toLocaleDateString() },
    { label: "Last Seen", value: new Date(row.lastSeen).toLocaleDateString() },
    { label: "Status", value: row.status },
    { label: "Tags", value: row.tags.slice(0, 3).join(", ") + (row.tags.length > 3 ? "..." : "") },
  ]
}

export function DataTable({ columns, data, focusId, changedRowIds = new Set() }: DataTableProps) {
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

  const pageCount = Math.ceil(sortedData.length / pageSize)

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
    // Don't trigger if clicking on buttons or interactive elements
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a") || target.closest('[role="button"]')) {
      return
    }

    router.push(`/inventory?focus=${appId}`)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when table is focused
      if (!tableBodyRef.current?.contains(document.activeElement)) return

      const maxIndex = paginatedData.length - 1

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedRowIndex((prev) => Math.min(prev + 1, maxIndex))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedRowIndex((prev) => Math.max(prev - 1, 0))
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
                <TableHead className="w-12 md:hidden">
                  <span className="sr-only">Expand</span>
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{
                      width: column.size ? `${column.size}px` : undefined,
                      minWidth: column.size ? `${column.size}px` : undefined,
                    }}
                    className={`h-11 px-3 text-xs font-semibold text-foreground uppercase tracking-wide whitespace-nowrap ${column.className || ""}`}
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
                    />
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-48">
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
          <div className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount || 1}
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
              disabled={pageIndex >= pageCount - 1}
              className="focus:ring-2 focus:ring-[#47D7FF]"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
