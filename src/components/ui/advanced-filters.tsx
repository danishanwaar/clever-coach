import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { 
  Filter, 
  Search, 
  X, 
  CalendarIcon, 
  SortAsc, 
  SortDesc,
  RotateCcw 
} from 'lucide-react';
import { format } from 'date-fns';
import { FilterState } from '@/hooks/useAdvancedFilters';

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onResetFilters: () => void;
  onClearFilter: (key: keyof FilterState) => void;
  activeFiltersCount: number;
  statusOptions?: Array<{ value: string; label: string }>;
  subjectOptions?: Array<{ value: string; label: string }>;
  learningModeOptions?: Array<{ value: string; label: string }>;
  sortOptions?: Array<{ value: string; label: string }>;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onClearFilter,
  activeFiltersCount,
  statusOptions = [],
  subjectOptions = [],
  learningModeOptions = [],
  sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' }
  ],
  className
}) => {
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    onFilterChange('status', newStatus);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status Filter */}
      {statusOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleStatusChange(option.value, !!checked)
                  }
                />
                <Label 
                  htmlFor={`status-${option.value}`}
                  className="text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  format(filters.dateRange.from, "PPP")
                ) : (
                  <span>From date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={(date) => onFilterChange('dateRange', { ...filters.dateRange, from: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !filters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to ? (
                  format(filters.dateRange.to, "PPP")
                ) : (
                  <span>To date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={(date) => onFilterChange('dateRange', { ...filters.dateRange, to: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Filter by city..."
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
        />
      </div>

      {/* Subject Filter */}
      {subjectOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={filters.subject} onValueChange={(value) => onFilterChange('subject', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Learning Mode */}
      {learningModeOptions.length > 0 && (
        <div className="space-y-2">
          <Label>Learning Mode</Label>
          <Select value={filters.learningMode} onValueChange={(value) => onFilterChange('learningMode', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select learning mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {learningModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort Options */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <div className="flex space-x-2">
          <Select value={filters.sortBy} onValueChange={(value) => onFilterChange('sortBy', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Reset Filters */}
      <Button 
        variant="outline" 
        onClick={onResetFilters}
        className="w-full"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Quick Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick search..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Advanced Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Refine your search with advanced filtering options
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center space-x-1">
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="text-xs">
              {status}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => handleStatusChange(status, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.location && (
            <Badge variant="secondary" className="text-xs">
              📍 {filters.location}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => onClearFilter('location')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};