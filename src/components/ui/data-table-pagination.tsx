import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { UsePaginationReturn } from '@/hooks/usePagination';

interface DataTablePaginationProps {
  pagination: UsePaginationReturn;
  showSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  pagination,
  showSizeSelector = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage
  } = pagination;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {showSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex w-[120px] items-center justify-center text-sm font-medium">
          {startIndex + 1}-{endIndex} of {totalItems}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => goToPage(1)}
          disabled={!hasPreviousPage}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={previousPage}
          disabled={!hasPreviousPage}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {renderPageNumbers()}
        </div>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => goToPage(totalPages)}
          disabled={!hasNextPage}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};