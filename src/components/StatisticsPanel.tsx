'use client';

import { Statistics } from '@/utils/types';
import { TrendingUp, TrendingDown, Minus, Database, BarChart3 } from 'lucide-react';

interface StatisticsPanelProps {
  stats: Statistics[];
}

export default function StatisticsPanel({ stats }: StatisticsPanelProps) {
  const getTrendIcon = (column: Statistics) => {
    if (column.mean !== undefined) {
      if (column.mean > 0) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
      if (column.mean < 0) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
    }
    return <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
  };

  const numericStats = stats.filter(s => s.mean !== undefined);
  const categoricalStats = stats.filter(s => s.mean === undefined);
  const totalRecords = stats[0]?.count !== undefined ? stats[0].count + (stats[0].missing || 0) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Database className="h-5 w-5 sm:h-8 sm:w-8 text-blue-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Toplam Sütun</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <BarChart3 className="h-5 w-5 sm:h-8 sm:w-8 text-green-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Sayısal Sütun</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{numericStats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Database className="h-5 w-5 sm:h-8 sm:w-8 text-purple-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Kategorik Sütun</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{categoricalStats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <BarChart3 className="h-5 w-5 sm:h-8 sm:w-8 text-orange-500" />
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Toplam Kayıt</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{totalRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-3 sm:p-4 border-b dark:border-gray-700">
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white">Sütun Bazlı İstatistikler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Sütun</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Kayıt</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Eksik</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Unique</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Ortalama</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Min</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 dark:text-gray-300">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {getTrendIcon(stat)}
                      <span className="font-medium text-gray-900 dark:text-white">{stat.column}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300">{stat.count}</td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    {stat.missing && stat.missing > 0 ? (
                      <span className="text-orange-600">{stat.missing}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300">{stat.unique}</td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300">
                    {stat.mean !== undefined ? stat.mean.toFixed(2) : '-'}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300">
                    {stat.min !== undefined ? stat.min.toFixed(2) : '-'}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300">
                    {stat.max !== undefined ? stat.max.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}