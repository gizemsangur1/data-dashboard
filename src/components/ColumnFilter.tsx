'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface ColumnFilterProps {
  data: Record<string, string | number>[];
  columns: string[];
  onFilter: (filteredData: Record<string, string | number>[]) => void;
}

export default function ColumnFilter({ data, columns, onFilter }: ColumnFilterProps) {
  const [activeFilters, setActiveFilters] = useState<Map<string, string>>(new Map());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const getUniqueValues = (column: string) => {
    const values = data.map(row => row[column]?.toString());
    return [...new Set(values)].slice(0, 100);
  };

  const applyFilter = (column: string, value: string) => {
    const newFilters = new Map(activeFilters);
    if (value) {
      newFilters.set(column, value);
    } else {
      newFilters.delete(column);
    }
    setActiveFilters(newFilters);

    let filtered = [...data];
    newFilters.forEach((filterValue, filterColumn) => {
      filtered = filtered.filter(row => 
        row[filterColumn]?.toString() === filterValue
      );
    });
    onFilter(filtered);
  };

  const clearFilters = () => {
    setActiveFilters(new Map());
    onFilter(data);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilterPanel(!showFilterPanel)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
      >
        <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
        <span>Filtrele</span>
        {activeFilters.size > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {activeFilters.size}
          </span>
        )}
      </button>

      {showFilterPanel && (
        <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-2">
          <div className="absolute inset-0 bg-black bg-opacity-50 sm:hidden" onClick={() => setShowFilterPanel(false)} />
          <div className="absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto w-full sm:w-80 bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sütun Filtreleri</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {columns.map(column => (
                  <div key={column}>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                      {column}
                    </label>
                    <select
                      value={activeFilters.get(column) || ''}
                      onChange={(e) => applyFilter(column, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Tümü</option>
                      {getUniqueValues(column).map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            {activeFilters.size > 0 && (
              <div className="p-3 sm:p-4 border-t dark:border-gray-700">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Tüm Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}