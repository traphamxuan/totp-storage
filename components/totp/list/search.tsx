"use client";

import { useState } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "../../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Table } from "@tanstack/react-table";

interface SearchProps<TData> {
    table: Table<TData>;
    onSearch: (value: string) => void;
}

// Debounce function for search
let timer: NodeJS.Timeout | null = null;
const debounce = (fn: () => void, delay: number) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        fn();
    }, delay);
};

export function Search<TData>({
    table,
    onSearch
}: SearchProps<TData>) {
    return (
        <div className="flex items-center space-x-2">
            <Input
                placeholder="Search issuer or label..."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => debounce(() => onSearch(event.target.value), 500)}
                className="max-w-sm"
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        ... <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}