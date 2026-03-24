'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';

interface ChartsProps {
  data: Record<string, string | number>[];
  xColumn: string;
  yColumn: string;
  correlation: number;
}

type ChartType = 'bar' | 'line' | 'scatter' | 'pie';

export default function Charts({ data, xColumn, yColumn, correlation }: ChartsProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const chartData = data.slice(0, 20).map((item, index) => ({
    name: item[xColumn]?.toString() || `Index ${index}`,
    x: item[xColumn],
    y: item[yColumn],
    value: item[yColumn]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const getCorrelationColor = (corr: number) => {
    if (corr > 0.7) return 'text-green-600';
    if (corr > 0.3) return 'text-blue-600';
    if (corr > -0.3) return 'text-gray-600';
    if (corr > -0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="y" fill="#3B82F6" name={yColumn} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="y" stroke="#10B981" name={yColumn} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={xColumn} />
              <YAxis dataKey="y" name={yColumn} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={`${xColumn} vs ${yColumn}`} data={chartData} fill="#F59E0B" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = chartData.slice(0, 6).map((item, idx) => ({
          name: item.name,
          value: typeof item.y === 'number' ? item.y : 0,
          key:idx
        }));
        return (
          <ResponsiveContainer width="100%" height={400} >
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Veri Görselleştirme</h2>
          <p className="text-sm text-gray-500 mt-1">
            {xColumn} vs {yColumn}
          </p>
          {correlation !== 0 && (
            <p className={`text-sm mt-2 font-medium ${getCorrelationColor(correlation)}`}>
              Korelasyon: {correlation.toFixed(3)}
              {correlation > 0.7 && ' (Güçlü pozitif ilişki)'}
              {correlation < -0.7 && ' (Güçlü negatif ilişki)'}
              {correlation > 0.3 && correlation <= 0.7 && ' (Orta pozitif ilişki)'}
              {correlation < -0.3 && correlation >= -0.7 && ' (Orta negatif ilişki)'}
              {correlation >= -0.3 && correlation <= 0.3 && ' (Zayıf ilişki)'}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Bar</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LineChartIcon className="h-4 w-4" />
            <span className="text-sm">Line</span>
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              chartType === 'scatter'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ScatterChartIcon className="h-4 w-4" />
            <span className="text-sm">Scatter</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              chartType === 'pie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PieChartIcon className="h-4 w-4" />
            <span className="text-sm">Pie</span>
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {renderChart()}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        * İlk 20 satır gösterilmektedir
      </div>
    </div>
  );
}