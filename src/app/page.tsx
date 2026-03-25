'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import Charts from '@/components/Charts';
import ThemeToggle from '@/components/ThemeToggle';
import ColumnFilter from '@/components/ColumnFilter';
import ExportButtons from '@/components/ExportButtons';
import DashboardLayout from '@/components/DashboardLayout';
import MissingDataHandler from '@/components/MissingDataHandler';
import OutlierDetector from '@/components/OutlierDetector';
import { calculateStatistics, calculateCorrelation } from '@/utils/statistics';
import { Statistics } from '@/utils/types';
import CategoricalEncoder from '@/components/CategoricalEncoder';
import DataTransformer from '@/components/DataTransformer';
import DistributionAnalyzer from '@/components/DistributionAnalyzer';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import StatisticalTests from '@/components/StatisticalTests';
import TimeSeriesAnalyzer from '@/components/TimeSeriesAnalyzer';

interface DataRow {
  [key: string]: string | number;
}

export default function Home() {
  const [originalData, setOriginalData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [stats, setStats] = useState<Statistics[]>([]);
  const [selectedXColumn, setSelectedXColumn] = useState<string>('');
  const [selectedYColumn, setSelectedYColumn] = useState<string>('');

  const handleDataLoaded = (loadedData: DataRow[], loadedHeaders: string[]) => {
    setOriginalData(loadedData);
    setFilteredData(loadedData);
    setHeaders(loadedHeaders);
    
    const calculatedStats = calculateStatistics(loadedData, loadedHeaders);
    setStats(calculatedStats);
    
    const numericColumns = calculatedStats
      .filter(s => s.mean !== undefined)
      .map(s => s.column);
    
    if (numericColumns.length >= 2) {
      setSelectedXColumn(numericColumns[0]);
      setSelectedYColumn(numericColumns[1]);
    } else if (numericColumns.length === 1) {
      setSelectedXColumn(numericColumns[0]);
      setSelectedYColumn(numericColumns[0]);
    } else if (loadedHeaders.length >= 2) {
      setSelectedXColumn(loadedHeaders[0]);
      setSelectedYColumn(loadedHeaders[1]);
    }
  };

  const handleDataUpdate = (newData: DataRow[]) => {
    setOriginalData(newData);
    setFilteredData(newData);
    
    const calculatedStats = calculateStatistics(newData, headers);
    setStats(calculatedStats);
    
    const numericColumns = calculatedStats
      .filter(s => s.mean !== undefined)
      .map(s => s.column);
    
    if (numericColumns.length >= 2) {
      setSelectedXColumn(numericColumns[0]);
      setSelectedYColumn(numericColumns[1]);
    }
  };

  const handleFilter = (filtered: DataRow[]) => {
    setFilteredData(filtered);
  };

  const correlation = selectedXColumn && selectedYColumn && selectedXColumn !== selectedYColumn
    ? calculateCorrelation(filteredData, selectedXColumn, selectedYColumn)
    : 0;

  const numericColumns = stats.filter(s => s.mean !== undefined).map(s => s.column);

  if (originalData.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Veri Analiz Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                CSV veya Excel dosyası yükleyerek verilerinizi analiz edin
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="max-w-2xl mx-auto">
            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      </main>
    );
  }

const analyticsComponent = (
  <div className="flex flex-wrap gap-3">
    <DistributionAnalyzer data={originalData} />
    <CorrelationMatrix data={originalData} />
    <StatisticalTests data={originalData} />
    <TimeSeriesAnalyzer data={originalData} />
  </div>
);

const preprocessingComponent = (
  <div className="flex flex-wrap gap-3">
    <MissingDataHandler 
      data={originalData} 
      onDataUpdate={handleDataUpdate} 
    />
    <OutlierDetector 
      data={originalData} 
      onDataUpdate={handleDataUpdate} 
    />
    <DataTransformer 
      data={originalData} 
      onDataUpdate={handleDataUpdate} 
    />
    <CategoricalEncoder 
      data={originalData} 
      onDataUpdate={handleDataUpdate} 
    />
  </div>
);

  const filtersComponent = (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <p className="text-green-700 dark:text-green-400 text-sm">
          {filteredData.length} / {originalData.length} satır gösteriliyor
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <ExportButtons 
          data={filteredData} 
          stats={stats} 
          filename={`veri_analiz_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`} 
        />
        <ColumnFilter 
          data={originalData} 
          columns={headers} 
          onFilter={handleFilter} 
        />
      </div>
    </div>
  );

  const statsComponent = <StatisticsPanel stats={stats} />;

  const chartsComponent = (
    <div>
      {numericColumns.length >= 2 && (
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                X Ekseni
              </label>
              <select
                value={selectedXColumn}
                onChange={(e) => setSelectedXColumn(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Y Ekseni
              </label>
              <select
                value={selectedYColumn}
                onChange={(e) => setSelectedYColumn(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {numericColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      {selectedXColumn && selectedYColumn && (
        <Charts 
          data={filteredData}
          xColumn={selectedXColumn}
          yColumn={selectedYColumn}
          correlation={correlation}
        />
      )}
    </div>
  );

  const tableComponent = <DataTable data={filteredData} headers={headers} />;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Veri Analiz Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              CSV veya Excel dosyası yükleyerek verilerinizi analiz edin
            </p>
          </div>
          <ThemeToggle />
        </div>
        
            <DashboardLayout 
        preprocessing={preprocessingComponent}
        analytics={analyticsComponent}
        filters={filtersComponent}
        stats={statsComponent}
        charts={chartsComponent}
        table={tableComponent}
      />
      </div>
    </main>
  );
}