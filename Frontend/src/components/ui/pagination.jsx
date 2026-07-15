import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Pagination = ({
  current = 1,
  total = 0,
  pageSize = 10,
  showSizeChanger = false,
  showQuickJumper = false,
  onChange,
  onShowSizeChange,
  className,
  ...props
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jumpPage, setJumpPage] = React.useState("")

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    onChange?.(page, pageSize)
  }

  const handleSizeChange = (newSize) => {
    onShowSizeChange?.(current, newSize)
  }

  const handleJump = () => {
    const page = parseInt(jumpPage, 10)
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setJumpPage("")
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push("...")
      pages.push(totalPages)
    } else if (current >= totalPages - 2) {
      pages.push(1)
      pages.push("...")
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push("...")
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
      <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={current === 1}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handlePageChange(current - 1)} disabled={current === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => (
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">...</span>
        ) : (
          <Button
            key={page}
            variant={current === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className="min-w-10"
          >
            {page}
          </Button>
        )
      ))}

      <Button variant="outline" size="sm" onClick={() => handlePageChange(current + 1)} disabled={current === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={current === totalPages}>
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {showSizeChanger && (
        <Select value={String(pageSize)} onValueChange={(value) => handleSizeChange(Number(value))}>
          <SelectTrigger className="ml-2 h-9 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
            <SelectItem value="100">100 / trang</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showQuickJumper && (
        <div className="ml-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Đi đến</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(event) => setJumpPage(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleJump()}
            className="h-9 w-16"
            placeholder="Trang"
          />
          <Button size="sm" onClick={handleJump}>Đi</Button>
        </div>
      )}

      <span className="ml-2 text-sm text-muted-foreground">
        Trang {current} / {totalPages} ({total} mục)
      </span>
    </div>
  )
}

export { Pagination }
