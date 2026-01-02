import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"

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
  const totalPages = Math.ceil(total / pageSize)
  const [jumpPage, setJumpPage] = React.useState('')

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    onChange?.(page, pageSize)
  }

  const handleSizeChange = (newSize) => {
    onShowSizeChange?.(current, newSize)
  }

  const handleJump = () => {
    const page = parseInt(jumpPage)
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page)
      setJumpPage('')
    }
  }

  // Always show pagination, even if only 1 page (for page size changer and info)
  // if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(1)}
        disabled={current === 1 || totalPages <= 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1 || totalPages <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {totalPages > 1 ? (
        getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <Button
              key={page}
              variant={current === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className={cn(
                "min-w-[40px]",
                current === page && "bg-primary text-white"
              )}
            >
              {page}
            </Button>
          )
        ))
      ) : (
        <span className="px-3 py-1 text-sm text-gray-600 font-medium">Trang 1</span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages || totalPages <= 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(totalPages)}
        disabled={current === totalPages || totalPages <= 1}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      {showSizeChanger && (
        <select
          value={pageSize}
          onChange={(e) => handleSizeChange(Number(e.target.value))}
          className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
          <option value={100}>100 / trang</option>
        </select>
      )}

      {showQuickJumper && (
        <div className="ml-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Đi đến</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJump()}
            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="Trang"
          />
          <Button size="sm" onClick={handleJump}>Đi</Button>
        </div>
      )}

      <span className="ml-4 text-sm text-gray-600">
        Trang {current} / {totalPages} ({total} mục)
      </span>
    </div>
  )
}

export { Pagination }


