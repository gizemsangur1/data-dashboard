'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  data: Record<string, string | number>[];
  headers: string[];
}

export default function DataTable({ data, headers }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-3 sm:p-4 border-b dark:border-gray-700">
        <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white">Veri Önizleme</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Toplam {data.length} satır, {headers.length} sütun
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {headers.map((header, colIdx) => (
                  <td key={colIdx} className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                    {row[header]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{startIndex + 1}</span> -{' '}
          <span className="font-medium">{Math.min(endIndex, data.length)}</span> /{' '}
          <span className="font-medium">{data.length}</span> kayıt
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 sm:px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 sm:px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}