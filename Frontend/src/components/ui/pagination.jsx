import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function Pagination({
  page = 1,
  totalItems = 0,
  itemsPerPage = 10,
  allowPageSizeChange = false,
  allowPageJump = false,
  showSizeChanger = false,
  showQuickJumper = false,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal,
  onPageChange,
  onPageSizeChange,
  className,
  ...props
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, itemsPerPage)));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const [jumpValue, setJumpValue] = React.useState('');
  const canChangeSize = allowPageSizeChange || showSizeChanger;
  const canJump = allowPageJump || showQuickJumper;
  const sizes = pageSizeOptions.map(Number).filter((value) => Number.isFinite(value) && value > 0);

  const goTo = (nextPage) => {
    const normalizedPage = Math.min(Math.max(1, Number(nextPage) || 1), totalPages);
    if (normalizedPage !== safePage) onPageChange?.(normalizedPage, itemsPerPage);
  };

  const handlePageSizeChange = (value) => {
    const nextSize = Number(value);
    if (!Number.isFinite(nextSize) || nextSize <= 0) return;

    if (onPageSizeChange?.length >= 2) {
      onPageSizeChange(1, nextSize);
    } else {
      onPageSizeChange?.(nextSize);
    }
  };

  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, safePage - 1, safePage, safePage + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))];

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(totalItems, safePage * itemsPerPage);
  const totalLabel = typeof showTotal === 'function'
    ? showTotal(totalItems, [rangeStart, rangeEnd])
    : `Trang ${safePage}/${totalPages} · ${totalItems} mục`;

  return (
    <nav
      aria-label="Phân trang"
      className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}
      {...props}
    >
      <span className="text-xs text-muted-foreground sm:text-sm">{totalLabel}</span>

      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        <Button type="button" variant="outline" size="icon" className="hidden h-8 w-8 sm:inline-flex" onClick={() => goTo(1)} disabled={safePage === 1} aria-label="Trang đầu">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(safePage - 1)} disabled={safePage === 1} aria-label="Trang trước">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {pages.map((pageNumber, index) => (
          <React.Fragment key={pageNumber}>
            {index > 0 && pageNumber - pages[index - 1] > 1 && <span className="px-0.5 text-muted-foreground">…</span>}
            <Button
              type="button"
              variant={safePage === pageNumber ? 'default' : 'outline'}
              size="sm"
              className="h-8 min-w-8 px-2"
              onClick={() => goTo(pageNumber)}
              aria-current={safePage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </Button>
          </React.Fragment>
        ))}

        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages} aria-label="Trang sau">
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="hidden h-8 w-8 sm:inline-flex" onClick={() => goTo(totalPages)} disabled={safePage === totalPages} aria-label="Trang cuối">
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>

        {canChangeSize && sizes.length > 0 && (
          <Select value={String(itemsPerPage)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-8 w-24" aria-label="Số mục mỗi trang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>{size} / trang</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {canJump && (
          <Input
            aria-label="Đi đến trang"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            placeholder="Trang"
            className="h-8 w-16"
            onChange={(event) => setJumpValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                goTo(jumpValue);
                setJumpValue('');
              }
            }}
          />
        )}
      </div>
    </nav>
  );
}

export { Pagination };
