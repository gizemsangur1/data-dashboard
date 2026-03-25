'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { BarChart3, Activity, TrendingUp, X } from 'lucide-react';

interface DistributionAnalyzerProps {
  data: Record<string, string | number>[];
}

type TabType = 'histogram' | 'density' | 'qq';

export default function DistributionAnalyzer({ data }: DistributionAnalyzerProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('histogram');

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

  const getColumnValues = () => {
    if (!selectedColumn) return [];
    return data
      .map(row => row[selectedColumn])
      .filter(v => typeof v === 'number') as number[];
  };

  const getHistogramData = () => {
    const values = getColumnValues();
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 20;
    const binWidth = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`,
      count: 0,
      center: min + (i + 0.5) * binWidth
    }));
    
    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
    });
    
    return bins;
  };

  const getDensityData = () => {
    const values = getColumnValues();
    if (values.length === 0) return [];
    
    const sorted = [...values].sort((a, b) => a - b);
    const densityPoints = [];
    const step = Math.ceil(sorted.length / 50);
    
    for (let i = 0; i < sorted.length; i += step) {
      const point = sorted[i];
      const bandwidth = (sorted[sorted.length - 1] - sorted[0]) / 30;
      let density = 0;
      
      sorted.forEach(v => {
        const u = (point - v) / bandwidth;
        density += Math.exp(-u * u / 2) / (bandwidth * Math.sqrt(2 * Math.PI));
      });
      density /= sorted.length;
      
      densityPoints.push({ value: point, density });
    }
    
    return densityPoints;
  };

  const getQQData = () => {
    const values = getColumnValues();
    if (values.length === 0) return [];
    
    const sorted = [...values].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const std = Math.sqrt(sorted.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sorted.length);
    
    return sorted.map((v, i) => ({
      theoretical: mean + std * (i + 1) / sorted.length,
      sample: v
    }));
  };

  const calculateSkewness = () => {
    const values = getColumnValues();
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const skewness = values.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / values.length;
    return skewness;
  };

  const calculateKurtosis = () => {
    const values = getColumnValues();
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const kurtosis = values.reduce((a, b) => a + Math.pow((b - mean) / std, 4), 0) / values.length - 3;
    return kurtosis;
  };

  const skewness = calculateSkewness();
  const kurtosis = calculateKurtosis();

  const getDistributionInterpretation = () => {
    if (Math.abs(skewness) < 0.5) return 'Simetrik dağılım';
    if (skewness > 0) return 'Pozitif çarpıklık (sağa çarpık)';
    return 'Negatif çarpıklık (sola çarpık)';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Dağılım Analizi</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dağılım Analizi
              </h2>
              <button
                onClick={() => setShowPanel(false)}
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

              {selectedColumn && (
                <>
                  <div className="flex gap-2 border-b dark:border-gray-700">
                    {[
                      { id: 'histogram', label: 'Histogram', icon: BarChart3 },
                      { id: 'density', label: 'Yoğunluk', icon: Activity },
                      { id: 'qq', label: 'QQ Plot', icon: TrendingUp }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeTab === 'histogram' && (
                          <BarChart data={getHistogramData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#06B6D4" />
                          </BarChart>
                        )}
                        {activeTab === 'density' && (
                          <LineChart data={getDensityData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="value" />
                            <YAxis dataKey="density" />
                            <Tooltip />
                            <Line type="monotone" dataKey="density" stroke="#06B6D4" strokeWidth={2} />
                          </LineChart>
                        )}
                        {activeTab === 'qq' && (
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="theoretical" name="Teorik Kantil" />
                            <YAxis dataKey="sample" name="Örnek Kantil" />
                            <Tooltip />
                            <Scatter data={getQQData()} fill="#06B6D4" />
                          </ScatterChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Örnek Sayısı</p>
                        <p className="text-xl font-bold">{getColumnValues().length}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Çarpıklık (Skewness)</p>
                        <p className="text-xl font-bold">{skewness.toFixed(3)}</p>
                        <p className="text-xs text-gray-500 mt-1">{getDistributionInterpretation()}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Basıklık (Kurtosis)</p>
                        <p className="text-xl font-bold">{kurtosis.toFixed(3)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {kurtosis > 0 ? 'Sivri dağılım' : kurtosis < 0 ? 'Basık dağılım' : 'Normal basıklık'}
                        </p>
                      </div>
                    </div>
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