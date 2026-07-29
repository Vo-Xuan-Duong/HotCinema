import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const DataTable = ({
  fields = [],
  rows = [],
  getRowId = "id",
  density = "default",
  loading = false,
  emptyMessage = "Không có dữ liệu",
  className,
}) => {
  const densityClass = {
    compact: "h-9 text-xs",
    default: "h-11 text-sm",
    comfortable: "h-14 text-base",
    small: "h-9 text-xs",
    large: "h-14 text-base",
  }[density] || "h-11 text-sm"

  if (loading) {
    return (
      <div className="space-y-2" aria-label="Đang tải dữ liệu">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border bg-card", className)}>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead
                  key={field.id || field.key || field.accessor}
                  className={cn("whitespace-nowrap bg-muted/40", densityClass)}
                  style={{ width: field.width }}
                >
                  {field.header ?? field.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(fields.length, 1)} className="h-28 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : rows.map((row, rowIndex) => {
              const rowId = typeof getRowId === "function"
                ? getRowId(row)
                : row[getRowId] ?? row.id ?? rowIndex

              return (
                <TableRow key={rowId} className="hover:bg-muted/30">
                  {fields.map((field) => {
                    const accessor = field.accessor ?? field.dataIndex
                    const value = accessor ? row[accessor] : undefined
                    const content = field.cell
                      ? field.cell({ value, row, rowIndex })
                      : field.render
                        ? field.render(value, row, rowIndex)
                        : value

                    return (
                      <TableCell
                        key={field.id || field.key || accessor}
                        className={cn(
                          "min-w-[8rem] align-middle",
                          densityClass,
                          field.truncate && "max-w-[16rem] truncate",
                          field.ellipsis && "max-w-[16rem] truncate"
                        )}
                      >
                        {content}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export { DataTable }
