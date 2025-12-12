"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Totp } from "@/lib/entities/totp";
import { Otp } from "./otp";

// Columns definition for TanStack Table
export const columns: ColumnDef<Totp>[] = [
    {
        accessorKey: "issuer",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Issuer
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            );
        },
        cell: ({ row }) => <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.getValue("issuer")}</div>,
    },
    {
        accessorKey: "label",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Label
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            );
        },
        cell: ({ row }) => <div className="text-sm text-gray-500 dark:text-gray-100">{row.getValue("label")}</div>,
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <button
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            );
        },
        cell: ({ row }) => (
            <div className="text-sm text-gray-500 dark:text-gray-100">
                {new Date(row.getValue("createdAt")).toLocaleDateString()}
            </div>
        ),
    },
    {
        id: "token",
        header: () => <label className="flex justify-center items-center px-2 py-1 rounded">Token</label>,
        cell: ({ row }) => <Otp entry={row.original} />,
    },
];