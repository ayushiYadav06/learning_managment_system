import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

const PAGE_SIZE = 10;

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = PAGE_SIZE,
  className,
}) {
  if (totalPages <= 1) return null;

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const maxVisible = 5;
  const pageNumbers = React.useMemo(() => {
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const left = Math.max(1, currentPage - 1);
    const right = Math.min(totalPages, currentPage + 1);
    const pages = new Set([1, ...Array.from({ length: right - left + 1 }, (_, i) => left + i), totalPages]);
    return Array.from(pages).sort((a, b) => a - b);
  }, [totalPages, currentPage]);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
        className,
      )}
    >
      <p className="text-sm text-slate-600 order-2 sm:order-1">
        {totalItems === 0 ? (
          'No items'
        ) : (
          <>
            Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{totalItems}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-md border-slate-200"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pageNumbers.map((page, idx) => (
          <React.Fragment key={page}>
            {idx > 0 && pageNumbers[idx - 1] !== page - 1 && (
              <span className="h-8 px-1 flex items-center text-slate-400">…</span>
            )}
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 min-w-8 rounded-md',
                currentPage === page
                  ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50',
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          </React.Fragment>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-md border-slate-200"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export { Pagination, PAGE_SIZE };
