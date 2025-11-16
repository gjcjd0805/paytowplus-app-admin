import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => {
                  const cellValue = column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '');
                  const textValue = typeof cellValue === 'string' || typeof cellValue === 'number'
                    ? String(cellValue)
                    : String(row[column.key] ?? '');

                  return (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-900 ${
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                      title={textValue}
                    >
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {cellValue}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
