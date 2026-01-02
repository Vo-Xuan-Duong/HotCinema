import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Skeleton } from "./skeleton"
import { cn } from "../../lib/utils"

const TableWrapper = ({ 
  columns = [],
  dataSource = [],
  data, // Hỗ trợ cả data và dataSource để tương thích
  rowKey = "id",
  pagination = false,
  size = "default",
  loading = false,
  className,
  ...props 
}) => {
  // Sử dụng dataSource nếu có, nếu không thì dùng data
  const actualDataSource = dataSource.length > 0 ? dataSource : (data || []);
  const sizeClasses = {
    small: "text-xs",
    default: "text-sm",
    large: "text-base",
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key || column.dataIndex}
                style={{ width: column.width }}
                className={sizeClasses[size]}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {actualDataSource.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            actualDataSource.map((record, index) => {
              const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey] || index
              return (
                <TableRow key={key}>
                  {columns.map((column) => {
                    const dataIndex = column.dataIndex
                    const value = dataIndex ? record[dataIndex] : null
                    const cellContent = column.render
                      ? column.render(value, record, index)
                      : value

                    return (
                      <TableCell
                        key={column.key || column.dataIndex}
                        className={cn(
                          sizeClasses[size],
                          column.ellipsis && "max-w-[200px] truncate"
                        )}
                      >
                        {cellContent}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export { TableWrapper }


