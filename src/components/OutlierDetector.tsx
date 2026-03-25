'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { TrendingUp, Trash2, Eye, X } from 'lucide-react';

interface OutlierDetectorProps {
  data: Record<string, string | number>[];
  onDataUpdate: (newData: Record<string, string | number>[]) => void;
}

export default function OutlierDetector({ data, onDataUpdate }: OutlierDetectorProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

const calculateQuartiles = (col: string) => {
  const values = (data
    .map(row => row[col])
    .filter(v => typeof v === 'number') as number[])
    .sort((a, b) => a - b);
  
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return { q1, q3, iqr, lowerBound, upperBound, min: values[0], max: values[values.length - 1] };
};

const detectOutliers = (col: string) => {
  const { lowerBound, upperBound } = calculateQuartiles(col);
  return data.map((row, idx) => {
    const value = row[col];
    const isOutlier = typeof value === 'number' && (value < lowerBound || value > upperBound);
    return { idx, value, isOutlier };
  });
};

  const removeOutliers = (col: string) => {
    const { lowerBound, upperBound } = calculateQuartiles(col);
    const newData = data.filter(row => {
      const value = row[col];
      return typeof value !== 'number' || (value >= lowerBound && value <= upperBound);
    });
    onDataUpdate(newData);
    setShowPanel(false);
    setSelectedColumn('');
  };

  const outliers = selectedColumn ? detectOutliers(selectedColumn) : [];
  const outlierCount = outliers.filter(o => o.isOutlier).length;
  const quartiles = selectedColumn ? calculateQuartiles(selectedColumn) : null;

  const chartData = selectedColumn && quartiles ? [
    { name: 'Min', value: quartiles.min },
    { name: 'Q1', value: quartiles.q1 },
    { name: 'Medyan', value: quartiles.q1 },
    { name: 'Q3', value: quartiles.q3 },
    { name: 'Max', value: quartiles.max }
  ] : [];

  const getBarColor = (name: string) => {
    if (name === 'Min' || name === 'Max') return '#EF4444';
    if (name === 'Q1' || name === 'Q3') return '#F59E0B';
    return '#3B82F6';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
      >
        <TrendingUp className="h-4 w-4" />
        <span>Aykırı Değer Tespiti</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Aykırı Değer Tespiti
              </h2>
              <button
                onClick={() => {
                  setShowPanel(false);
                  setSelectedColumn('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Analiz Edilecek Sütun
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Sütun seçin</option>
                  {numericColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {selectedColumn && quartiles && (
                <>
                  <div className={`p-4 rounded-lg ${outlierCount > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                    <p className={`text-sm ${outlierCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                      {outlierCount > 0 
                        ? `⚠️ ${outlierCount} aykırı değer tespit edildi (${((outlierCount / data.length) * 100).toFixed(1)}%)`
                        : `✅ Aykırı değer tespit edilmedi`
                      }
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 dark:border-gray-700">
                    <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Veri Dağılımı</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500">Min</p>
                        <p className="font-semibold">{quartiles.min.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500">Q1</p>
                        <p className="font-semibold">{quartiles.q1.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500">Medyan</p>
                        <p className="font-semibold">{quartiles.q1.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500">Q3</p>
                        <p className="font-semibold">{quartiles.q3.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-500">Max</p>
                        <p className="font-semibold">{quartiles.max.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value">
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Alt Sınır: {quartiles.lowerBound.toFixed(2)} | Üst Sınır: {quartiles.upperBound.toFixed(2)}
                    </p>
                  </div>

                  {outlierCount > 0 && (
                    <div className="border rounded-lg p-4 dark:border-gray-700">
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Aykırı Değerler</h3>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left">Satır</th>
                              <th className="px-3 py-2 text-left">Değer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outliers.filter(o => o.isOutlier).slice(0, 20).map((item, idx) => (
                              <tr key={idx} className="bg-red-50 dark:bg-red-900/20">
                                <td className="px-3 py-2">{item.idx + 1}</td>
                                <td className="px-3 py-2 font-medium text-red-600">{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {outliers.filter(o => o.isOutlier).length > 20 && (
                          <p className="text-xs text-gray-500 mt-2">İlk 20 aykırı değer gösteriliyor</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={() => removeOutliers(selectedColumn)}
                      disabled={outlierCount === 0}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        outlierCount > 0
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-300 cursor-not-allowed text-gray-500'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Aykırı Değerleri Temizle ({outlierCount})
                    </button>
                    <button
                      onClick={() => {
                        setShowPanel(false);
                        setSelectedColumn('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}