'use client';

import { Statistics } from '@/utils/types';
import { TrendingUp, TrendingDown, Minus, Database, BarChart3 } from 'lucide-react';

interface StatisticsPanelProps {
  stats: Statistics[];
}

export default function StatisticsPanel({ stats }: StatisticsPanelProps) {
  const getTrendIcon = (column: Statistics) => {
    if (column.mean !== undefined) {
      if (column.mean > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (column.mean < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const numericStats = stats.filter(s => s.mean !== undefined);
  const categoricalStats = stats.filter(s => s.mean === undefined);
  
  const totalRecords = stats[0]?.count !== undefined ? stats[0].count + (stats[0].missing || 0) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Toplam Sütun</p>
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-700">Sayısal Sütun</p>
              <p className="text-2xl font-bold">{numericStats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-700">Kategorik Sütun</p>
              <p className="text-2xl font-bold">{categoricalStats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-700">Toplam Kayıt</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Sütun Bazlı İstatistikler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sütun Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Sayısı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eksik Veri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ortalama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medyan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Std. Sapma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((stat, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(stat)}
                      <span className="font-medium text-sm text-gray-500">{stat.column}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{stat.count}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.missing && stat.missing > 0 ? (
                      <span className="text-orange-600">{stat.missing}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{stat.unique}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.mean !== undefined ? stat.mean.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.median !== undefined ? stat.median.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.min !== undefined ? stat.min.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.max !== undefined ? stat.max.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stat.std !== undefined ? stat.std.toFixed(2) : '-'}
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