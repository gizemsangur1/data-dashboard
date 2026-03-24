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
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm">Filtrele</span>
        {activeFilters.size > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilters.size}
          </span>
        )}
      </button>

      {showFilterPanel && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Sütun Filtreleri</h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {columns.map(column => (
              <div key={column}>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  {column}
                </label>
                <select
                  value={activeFilters.get(column) || ''}
                  onChange={(e) => applyFilter(column, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                >
                  <option value="">Tümü</option>
                  {getUniqueValues(column).map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          {activeFilters.size > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Tüm Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}