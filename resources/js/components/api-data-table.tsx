import { LaravelPagination } from '@/components/laravel-pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table as UITable } from '@/components/ui/table';
import { type BaseFilters, type GenericApiService, type PaginationMeta } from '@/types/api';
import {
    ColumnDef,
    ColumnFiltersState,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type RowSelectionState,
    type Table,
} from '@tanstack/react-table';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Debounce utility function
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        className?: string;
    }
}

interface ApiDataTableProps<TData, TValue, TFilters extends BaseFilters = BaseFilters> {
    columns: ColumnDef<TData, TValue>[];
    enableRowSelection?: boolean;
    toolbar?: React.ReactElement<{ table?: Table<TData> }>;
    emptyMessage?: string;
    loadingRows?: number;
    initialFilters?: TFilters;
    onPaginationChange?: (pagination: PaginationMeta) => void;
    showPagination?: boolean;
    apiService: GenericApiService<TData, TFilters>;
    searchField?: keyof TFilters;
    filterFields?: Array<keyof TFilters>;
}

export function ApiDataTable<TData, TValue, TFilters extends BaseFilters = BaseFilters>({
    columns,
    enableRowSelection = true,
    toolbar,
    emptyMessage = 'No results.',
    loadingRows = 5,
    initialFilters = {} as TFilters,
    onPaginationChange,
    showPagination = true,
    apiService,
    searchField = 'global' as keyof TFilters,
    filterFields = [],
}: ApiDataTableProps<TData, TValue, TFilters>) {
    const [data, setData] = useState<TData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
        path: '',
        links: [],
    });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [filters, setFilters] = useState<TFilters>(initialFilters);

    // Debounce the search value to prevent excessive API calls
    // Prefer the toolbar's configured searchKey (e.g., 'name') as the source of the search input,
    // but still send it to the API under `searchField` (e.g., 'global').
    const toolbarSearchKey = (toolbar as any)?.props?.searchKey as string | undefined;
    const searchFilterId = (toolbarSearchKey ?? searchField) as string;
    const searchFilter = columnFilters.find((f) => f.id === searchFilterId);
    const debouncedSearchValue = useDebounce(searchFilter?.value || '', 500);

    // Debounce other filter values as well
    const debouncedColumnFilters = useDebounce(columnFilters, 300);

    // Rate limiting to prevent too many concurrent requests
    const isRequestInProgress = useRef(false);
    const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    const isMountedRef = useRef(true);

    // Fetch data from API
    const fetchData = useCallback(
        async (apiFilters: TFilters) => {
            // Prevent concurrent requests
            if (isRequestInProgress.current) {
                return;
            }

            // Clear any pending timeout
            if (requestTimeoutRef.current) {
                clearTimeout(requestTimeoutRef.current);
            }

            // Set rate limiting timeout
            requestTimeoutRef.current = setTimeout(() => {
                isRequestInProgress.current = false;
            }, 1000); // Minimum 1 second between requests

            isRequestInProgress.current = true;
            setLoading(true);
            setError(null);

            try {
                // Add global search if available
                if (debouncedSearchValue) {
                    (apiFilters as any)[searchField] = debouncedSearchValue as string;
                }

                // Add exact filters for specified filter fields
                filterFields.forEach((field) => {
                    const filter = debouncedColumnFilters.find((f) => f.id === field);
                    if (filter?.value !== undefined && filter?.value !== null && filter?.value !== '') {
                        const rawValue = filter.value as any;
                        const normalizedValue = Array.isArray(rawValue) ? (rawValue.length > 0 ? rawValue[0] : undefined) : rawValue;
                        if (normalizedValue !== undefined) {
                            (apiFilters as any)[field] = normalizedValue as string;
                        }
                    }
                });

                const response = await apiService.getItems(apiFilters);

                // Check if component is still mounted before updating state
                if (!isMountedRef.current) {
                    return;
                }

                // Ensure we have valid data and pagination
                const validData = Array.isArray(response.data) ? response.data : [];
                console.log(validData);
                const validPagination =
                    response.meta && typeof response.meta === 'object'
                        ? response.meta
                        : {
                              current_page: 1,
                              last_page: 1,
                              per_page: apiFilters.per_page || 10,
                              total: 0,
                              from: 0,
                              to: 0,
                              path: '',
                              links: [],
                          };

                setData(validData as TData[]);
                setPagination(validPagination);
                onPaginationChange?.(validPagination);
            } catch (err: any) {
                // Check if component is still mounted before updating state
                if (!isMountedRef.current) {
                    return;
                }

                console.error('Error fetching data:', err);

                // Handle specific error types
                if (err.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
                    setError('Server resources are temporarily unavailable. Please try again in a moment.');

                    // Retry with exponential backoff for resource issues
                    if (retryCountRef.current < maxRetries) {
                        retryCountRef.current++;
                        const delay = Math.pow(2, retryCountRef.current) * 1000; // 2s, 4s, 8s

                        setTimeout(() => {
                            if (isMountedRef.current) {
                                fetchData(apiFilters);
                            }
                        }, delay);

                        return; // Don't set loading to false yet
                    }
                } else if (err.response?.status === 429) {
                    setError('Too many requests. Please wait a moment before trying again.');
                } else if (err.response?.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError('Failed to load data. Please check your connection and try again.');
                }

                // Reset retry count on non-resource errors
                retryCountRef.current = 0;
                setData([]);
                // Keep the current pagination state on error
                // Don't call onPaginationChange to avoid undefined errors
            } finally {
                // Check if component is still mounted before updating state
                if (isMountedRef.current) {
                    setLoading(false);
                    isRequestInProgress.current = false;
                }
            }
        },
        [sorting, debouncedColumnFilters, apiService, searchField, filterFields, debouncedSearchValue],
    );

    // Update filters when initialFilters prop changes (for external pagination control)
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    // Fetch data when filters change (for pagination)
    useEffect(() => {
        // Reset retry count when filters change
        retryCountRef.current = 0;
        fetchData(filters);
    }, [filters]);

    // Cleanup function to clear timeouts
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (requestTimeoutRef.current) {
                clearTimeout(requestTimeoutRef.current);
            }
        };
    }, []);

    // Update filters when table state changes (but don't trigger fetchData here)
    useEffect(() => {
        const newFilters: TFilters = { ...filters };

        // Update global search
        if (debouncedSearchValue) {
            (newFilters as any)[searchField] = debouncedSearchValue as string;
        } else {
            delete (newFilters as any)[searchField];
        }

        // Update exact filters for specified filter fields
        filterFields.forEach((field) => {
            const filter = debouncedColumnFilters.find((f) => f.id === field);
            if (filter?.value !== undefined && filter?.value !== null && filter?.value !== '') {
                const rawValue = filter.value as any;
                const normalizedValue = Array.isArray(rawValue) ? (rawValue.length > 0 ? rawValue[0] : undefined) : rawValue;
                if (normalizedValue !== undefined) {
                    (newFilters as any)[field] = normalizedValue as string;
                } else {
                    delete (newFilters as any)[field];
                }
            } else {
                delete (newFilters as any)[field];
            }
        });

        // Update sorting (Spatie format)
        if (sorting.length > 0) {
            const sort = sorting[0];
            newFilters.sort = sort.desc ? `-${sort.id}` : sort.id;
        } else {
            delete newFilters.sort;
        }

        // Always reset to first page when filters or sorting change
        (newFilters as any).page = 1;

        // Only update filters if they actually changed to prevent infinite loops
        const hasChanges = JSON.stringify(newFilters) !== JSON.stringify(filters);
        if (hasChanges) {
            setFilters(newFilters);
        }
    }, [debouncedColumnFilters, sorting, searchField, filterFields, debouncedSearchValue]); // Removed 'filters' from dependencies

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: {
                pageIndex: pagination.current_page - 1,
                pageSize: pagination.per_page,
            },
        },
        enableRowSelection,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        // Disable client-side pagination since we're using server-side
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        // Set pagination state
        pageCount: pagination.last_page,
    });

    const renderLoadingRows = () => {
        return Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={`loading-${index}`}>
                {columns.map((_, colIndex) => (
                    <TableCell key={`loading-cell-${index}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    const renderErrorRow = () => {
        if (!error) return null;

        const isRetrying = retryCountRef.current > 0 && retryCountRef.current < maxRetries;

        return (
            <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                    <Alert variant="destructive">
                        <AlertDescription className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <span>{error}</span>
                                {isRetrying && (
                                    <span className="text-sm text-muted-foreground">
                                        Retrying in {Math.pow(2, retryCountRef.current)} seconds... (Attempt {retryCountRef.current}/{maxRetries})
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    retryCountRef.current = 0;
                                    fetchData(filters);
                                }}
                                disabled={loading || isRetrying}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'Retrying...' : 'Retry'}
                            </Button>
                        </AlertDescription>
                    </Alert>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <div className="space-y-4">
            {toolbar && React.cloneElement(toolbar, { table } as any)}
            <div className="overflow-hidden rounded-md border">
                <UITable>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="group/row">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan} className={header.column.columnDef.meta?.className ?? ''}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            renderLoadingRows()
                        ) : error ? (
                            renderErrorRow()
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group/row">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className ?? ''}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </UITable>
            </div>
            {showPagination && (
                <LaravelPagination
                    pagination={pagination}
                    onPageChange={(page) => {
                        const newFilters = { ...filters, page };
                        setFilters(newFilters);
                    }}
                />
            )}
        </div>
    );
}
