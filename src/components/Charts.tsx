'use client';

import { useState, useEffect } from 'react';
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const getChartHeight = () => {
    if (isMobile) return 300;
    if (isTablet) return 350;
    return 400;
  };

  const getLabelAngle = () => {
    if (isMobile) return -90;
    if (isTablet) return -60;
    return -45;
  };

  const getLabelMargin = () => {
    if (isMobile) return { top: 20, right: 30, left: 0, bottom: 60 };
    if (isTablet) return { top: 20, right: 30, left: 0, bottom: 40 };
    return { top: 20, right: 30, left: 0, bottom: 20 };
  };

  const chartData = data.slice(0, isMobile ? 10 : 20).map((item, index) => ({
    name: item[xColumn]?.toString() || `Index ${index}`,
    x: item[xColumn],
    y: item[yColumn],
    value: item[yColumn]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const getCorrelationColor = (corr: number) => {
    if (corr > 0.7) return 'text-green-600 dark:text-green-400';
    if (corr > 0.3) return 'text-blue-600 dark:text-blue-400';
    if (corr > -0.3) return 'text-gray-600 dark:text-gray-400';
    if (corr > -0.7) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderChart = () => {
    const height = getChartHeight();
    const angle = getLabelAngle();
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={getLabelMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={angle} 
                textAnchor="end" 
                height={isMobile ? 100 : 80}
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip contentStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Bar dataKey="y" fill="#3B82F6" name={yColumn} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={getLabelMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={angle} 
                textAnchor="end" 
                height={isMobile ? 100 : 80}
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip contentStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Line type="monotone" dataKey="y" stroke="#10B981" name={yColumn} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={getLabelMargin()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="x" 
                name={xColumn} 
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                dataKey="y" 
                name={yColumn} 
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              <Scatter 
                name={`${xColumn} vs ${yColumn}`} 
                data={chartData} 
                fill="#F59E0B" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = chartData.slice(0, isMobile ? 4 : 6).map((item, idx) => ({
          name: item.name.length > (isMobile ? 10 : 20) ? item.name.slice(0, isMobile ? 8 : 17) + '...' : item.name,
          value: typeof item.y === 'number' ? item.y : 0,
          key: idx
        }));
        const outerRadius = isMobile ? 80 : (isTablet ? 120 : 150);
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                label={isMobile ? false : (entry) => `${entry.name}: ${entry.value}`}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: isMobile ? 10 : 12 }} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-white">
            Veri Görselleştirme
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {xColumn} vs {yColumn}
          </p>
          {correlation !== 0 && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 font-medium ${getCorrelationColor(correlation)}`}>
              Korelasyon: {correlation.toFixed(3)}
              {!isMobile && (
                <>
                  {correlation > 0.7 && ' (Güçlü pozitif ilişki)'}
                  {correlation < -0.7 && ' (Güçlü negatif ilişki)'}
                  {correlation > 0.3 && correlation <= 0.7 && ' (Orta pozitif ilişki)'}
                  {correlation < -0.3 && correlation >= -0.7 && ' (Orta negatif ilişki)'}
                  {correlation >= -0.3 && correlation <= 0.3 && ' (Zayıf ilişki)'}
                </>
              )}
            </p>
          )}
        </div>
        
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Bar</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LineChartIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Line2</span>
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              chartType === 'scatter'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ScatterChartIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Scatter</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
              chartType === 'pie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <PieChartIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Pie</span>
          </button>
        </div>
      </div>
      
      <div className="mt-2 sm:mt-4">
        {renderChart()}
      </div>
      
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
        * İlk {isMobile ? 10 : 20} satır gösterilmektedir
      </div>
    </div>
  );
}