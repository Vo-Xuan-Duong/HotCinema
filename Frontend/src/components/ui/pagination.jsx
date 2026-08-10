import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

function Pagination({
  page = 1,
  totalItems = 0,
  itemsPerPage = 10,
  allowPageSizeChange = false,
  allowPageJump = false,
  onPageChange,
  onPageSizeChange,
  className,
  ...props
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const [jumpValue, setJumpValue] = React.useState("")
  const goTo = (nextPage) => nextPage >= 1 && nextPage <= totalPages && onPageChange?.(nextPage, itemsPerPage)
  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, page - 1, page, page + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))]

  return (
    <nav aria-label="Phân trang" className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goTo(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goTo(page - 1)} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
      {pages.map((pageNumber, index) => (
        <React.Fragment key={pageNumber}>
          {index > 0 && pageNumber - pages[index - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Button variant={page === pageNumber ? "default" : "outline"} size="sm" className="min-w-9" onClick={() => goTo(pageNumber)}>{pageNumber}</Button>
        </React.Fragment>
      ))}
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goTo(page + 1)} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goTo(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
      {allowPageSizeChange && (
        <Select value={String(itemsPerPage)} onValueChange={(value) => onPageSizeChange?.(page, Number(value))}>
          <SelectTrigger className="h-9 w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[10, 20, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size} / trang</SelectItem>)}</SelectContent>
        </Select>
      )}
      {allowPageJump && (
        <Input
          aria-label="Đi đến trang"
          type="number"
          min={1}
          max={totalPages}
          value={jumpValue}
          className="h-9 w-20"
          onChange={(event) => setJumpValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && goTo(Number(jumpValue))}
        />
      )}
      <span className="text-sm text-muted-foreground">Trang {page}/{totalPages} · {totalItems} mục</span>
    </nav>
  )
}

export { Pagination }
