"use client";

import { ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
}: DataTableProps<T>) {
  // Column 정의를 TanStack React Table 형식으로 변환
  const columnDefs: ColumnDef<T>[] = columns.map((col) => ({
    id: col.key,
    accessorKey: col.key,
    header: () => (
      <div
        className={`flex items-center ${
          col.align === "center"
            ? "justify-center"
            : col.align === "right"
            ? "justify-end"
            : "justify-start"
        }`}
      >
        {col.header}
        {col.sortable && sortKey === col.key && (
          <span className="ml-1 text-xs">
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    ),
    cell: (info) => {
      const row = info.row.original;
      const rowIndex = info.row.index;
      return (
        <div
          className={`overflow-hidden text-ellipsis whitespace-nowrap ${
            col.align === "center"
              ? "text-center"
              : col.align === "right"
              ? "text-right"
              : "text-left"
          }`}
        >
          {col.render ? col.render(row, rowIndex) : (info.getValue() as ReactNode)}
        </div>
      );
    },
    size: col.width ? parseInt(col.width) : undefined,
    enableSorting: col.sortable || false,
  }));

  const columnResizeMode: ColumnResizeMode = "onChange";

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode,
  });

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full divide-y divide-gray-200 text-xs sm:text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const col = columns.find((c) => c.key === header.id);
                return (
                  <th
                    key={header.id}
                    style={{
                      position: "relative",
                    }}
                    className={`px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      col?.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    onClick={() => handleSort(header.id, col?.sortable)}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {/* Resizer */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-transparent hover:bg-blue-400"
                        style={{
                          userSelect: "none",
                        }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
