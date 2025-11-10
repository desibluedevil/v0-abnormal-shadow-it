"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ShadowApp } from "@/types/shadow-it"

interface Column {
  id: string
  header: string | (() => React.ReactNode)
  accessor?: keyof ShadowApp | ((row: ShadowApp) => any)
  cell: (row: ShadowApp) => React.ReactNode
  size?: number
  sortable?: boolean
  sortingFn?: (a: ShadowApp, b: ShadowApp) => number
  className?: string // Added className prop for responsive hiding
}

interface DataTableProps {
  columns: Column[]
  data: ShadowApp[]
  focusId?: string
  changedRowIds?: Set<string>
}

export function DataTable({ columns, data, focusId, changedRowIds = new Set() }: DataTableProps) {
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" } | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(25)

  const focusRowRef = useRef<HTMLTableRowElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (focusId && focusRowRef.current) {
      focusRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [focusId])

  const sortedData = useMemo(() => {
    if (!sorting) return data

    const column = columns.find((c) => c.id === sorting.column)
    if (!column) return data

    return [...data].sort((a, b) => {
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
  }, [data, sorting, columns])

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

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card border-b border-border">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{
                      width: column.size ? `${column.size}px` : undefined,
                      minWidth: column.size ? `${column.size}px` : undefined,
                    }}
                    className={`h-11 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${column.className || ""}`}
                  >
                    <div
                      className={
                        column.sortable !== false
                          ? "cursor-pointer select-none flex items-center gap-2 hover:text-foreground"
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
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const isFocused = focusId === row.id
                  const isRevoked = row.status === "Revoked"
                  const isChanged = changedRowIds.has(row.id)
                  return (
                    <TableRow
                      key={row.id}
                      ref={isFocused ? focusRowRef : null}
                      onClick={(e) => handleRowClick(row.id, e)}
                      className={`h-12 hover:bg-muted/50 transition-colors cursor-pointer ${
                        isFocused ? "ring-2 ring-primary ring-inset bg-primary/10" : ""
                      } ${isRevoked ? "text-muted-foreground" : ""} ${isChanged ? "animate-pulse bg-green-100/10" : ""}`}
                    >
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
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="text-4xl">📭</div>
                      <p className="text-sm font-medium">No apps found</p>
                      <p className="text-xs">Try adjusting your filters or search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground">Rows per page:</p>
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
          <div className="text-sm text-foreground">
            Page {pageIndex + 1} of {pageCount || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev - 1)}
              disabled={pageIndex === 0}
              className="focus:ring-2 focus:ring-primary"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => prev + 1)}
              disabled={pageIndex >= pageCount - 1}
              className="focus:ring-2 focus:ring-primary"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
