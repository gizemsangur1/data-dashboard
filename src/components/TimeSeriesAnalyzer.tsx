'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, X, TrendingUp, TrendingDown } from 'lucide-react';

interface TimeSeriesAnalyzerProps {
  data: Record<string, string | number>[];
}

export default function TimeSeriesAnalyzer({ data }: TimeSeriesAnalyzerProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [dateColumn, setDateColumn] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');

  const dateColumns = Object.keys(data[0] || {}).filter(col => {
    const sample = data[0]?.[col]?.toString();
    return sample && (sample.includes('-') || sample.includes('/') || sample.includes('.'));
  });

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split(/[-/.]/);
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return isNaN(date.getTime()) ? null : date;
  };

  const getTimeSeriesData = () => {
    if (!dateColumn || !valueColumn) return [];
    
    const series: { date: Date; value: number; label: string }[] = [];
    
    data.forEach(row => {
      const dateStr = row[dateColumn]?.toString();
      const value = row[valueColumn];
      if (dateStr && typeof value === 'number') {
        const date = parseDate(dateStr);
        if (date) {
          series.push({
            date,
            value,
            label: date.toLocaleDateString('tr-TR')
          });
        }
      }
    });
    
    return series.sort((a, b) => a.date.getTime() - b.date.getTime()).map(s => ({
      date: s.label,
      value: s.value
    }));
  };

  const calculateTrend = () => {
    const series = getTimeSeriesData();
    if (series.length < 2) return { slope: 0, direction: 'yetersiz veri' };
    
    const n = series.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const values = series.map(s => s.value);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((a, b, i) => a + b * values[i], 0);
    const sumX2 = indices.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    let direction = 'yatay';
    if (slope > 0.01) direction = 'yükselen';
    if (slope < -0.01) direction = 'düşen';
    
    return { slope, direction };
  };

  const calculateSeasonality = () => {
    const series = getTimeSeriesData();
    if (series.length < 4) return null;
    
    const monthlyAvg: Record<number, { sum: number; count: number }> = {};
    
    series.forEach((item, idx) => {
      const month = idx % 12;
      if (!monthlyAvg[month]) monthlyAvg[month] = { sum: 0, count: 0 };
      monthlyAvg[month].sum += item.value;
      monthlyAvg[month].count++;
    });
    
    const overallAvg = series.reduce((a, b) => a + b.value, 0) / series.length;
    const seasonality: Record<string, number> = {};
    
    Object.keys(monthlyAvg).forEach(month => {
      const avg = monthlyAvg[parseInt(month)].sum / monthlyAvg[parseInt(month)].count;
      seasonality[`Ay ${parseInt(month) + 1}`] = (avg / overallAvg - 1) * 100;
    });
    
    return seasonality;
  };

  const timeSeriesData = getTimeSeriesData();
  const trend = calculateTrend();
  const seasonality = calculateSeasonality();

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        title="Zaman Serisi Analizi"
      >
        <Calendar className="h-5 w-5" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Zaman Serisi Analizi
              </h2>
              <button
                onClick={() => setShowPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarih Sütunu
                  </label>
                  <select
                    value={dateColumn}
                    onChange={(e) => setDateColumn(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                  >
                    <option value="">Seçiniz</option>
                    {dateColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  {dateColumns.length === 0 && (
                    <p className="text-xs text-yellow-500 mt-1">Tarih sütunu bulunamadı</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Değer Sütunu
                  </label>
                  <select
                    value={valueColumn}
                    onChange={(e) => setValueColumn(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                  >
                    <option value="">Seçiniz</option>
                    {numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              {dateColumn && valueColumn && timeSeriesData.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Veri Noktası Sayısı</p>
                      <p className="text-xl font-bold">{timeSeriesData.length}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Trend Yönü</p>
                      <div className="flex items-center gap-2">
                        {trend.direction === 'yükselen' && <TrendingUp className="h-5 w-5 text-green-500" />}
                        {trend.direction === 'düşen' && <TrendingDown className="h-5 w-5 text-red-500" />}
                        {trend.direction === 'yatay' && <Calendar className="h-5 w-5 text-gray-500" />}
                        <p className="text-xl font-bold">{trend.direction}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Eğim (Trend Gücü)</p>
                      <p className="text-xl font-bold">{trend.slope.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {seasonality && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium mb-3">Mevsimsellik Analizi</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.entries(seasonality).map(([month, change]) => (
                          <div key={month} className="text-center p-2 bg-white dark:bg-gray-600 rounded">
                            <p className="text-xs font-medium">{month}</p>
                            <p className={`text-sm font-bold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        * Pozitif yüzde ortalamanın üzerinde, negatif yüzde ortalamanın altında olduğunu gösterir.
                      </p>
                    </div>
                  )}
                </>
              )}

              {dateColumn && valueColumn && timeSeriesData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tarih ve değer sütunları eşleştirilemedi. Lütfen geçerli bir tarih formatı kullanın.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}