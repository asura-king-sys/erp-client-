import React from 'react';
import Spinner from './Spinner';

const Table = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found'
}) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <Spinner className="mx-auto" />
              </td>
            </tr>
          ) : (!data || data.length === 0) ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            (data || []).map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
