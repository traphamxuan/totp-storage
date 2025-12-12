"use client";

import { useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useTotpContext } from "@/components/totp"; // Changed to use the correct path
import { columns } from "./column";
import { Search } from "./search";
import { Button } from "../../ui/button";

export function OtpList() {
    const { onFetch, data: { loading, totps, total, page, filter, search } } = useTotpContext();

    // Create table instance
    const table = useReactTable({
        data: totps,
        columns,
        pageCount: Math.ceil(total / page.size),
        state: {
            sorting: page.sort && Array.isArray(page.sort) && page.sort.length > 0
                ? page.sort.map(col => ({ id: col.field, desc: col.order === "desc" }))
                : [],
            pagination: {
                pageIndex: page.page - 1, // TanStack uses 0-based indexing
                pageSize: page.size,
            },
        },
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function'
                ? updater(table.getState().sorting)
                : updater;

            onFetch(filter, {
                ...page,
                sort: newSorting.map(sort => (
                    { field: sort.id, order: sort.desc ? 'desc' : 'asc' }
                )),
            }, search);
        },
        onPaginationChange: (updater) => {
            // Handle pagination changes
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page.page - 1, pageSize: page.size })
                : updater;

            const newPageIndex = 'pageIndex' in newState ? newState.pageIndex : page.page - 1;
            const newPage = newPageIndex + 1;

            // Trigger data fetch with new pagination only if page changed
            if (newPage !== page.page) {
                onFetch(filter, { ...page, page: newPage }, search);
            }
        },
        enableSortingRemoval: true,
        manualPagination: true, // We're handling pagination manually with our API
        manualSorting: true, // We're handling sorting manually with our API
        manualFiltering: true, // We're handling filtering manually with our API
        rowCount: total,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    // Effect to handle initial data fetch
    useEffect(() => {
        onFetch(filter, page, search);
    }, []);

    return (
        <div className="bg-background rounded-lg shadow-md p-6">
            {/* Header row with title, search, and column visibility toggle */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Public Keys</h2>
                <Search
                    table={table}
                    onSearch={(value) => onFetch(filter, { ...page, page: 1 }, value)}
                />
            </div>

            {(loading && totps.length === 0) ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : totps.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No TOTP keys stored yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Showing {table.getCanNextPage() ? table.getRowModel().rows.length : total % page.size} item(s) in {page.page} of {table.getPageCount()} pages
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || loading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || loading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}