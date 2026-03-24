'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import Charts from '@/components/Charts';
import ThemeToggle from '@/components/ThemeToggle';
import ColumnFilter from '@/components/ColumnFilter';
import { calculateStatistics, calculateCorrelation } from '@/utils/statistics';
import { Statistics } from '@/utils/types';
import ExportButtons from '@/components/ExportButtons';

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

  const handleFilter = (filtered: DataRow[]) => {
    setFilteredData(filtered);
  };

  const correlation = selectedXColumn && selectedYColumn && selectedXColumn !== selectedYColumn
    ? calculateCorrelation(filteredData, selectedXColumn, selectedYColumn)
    : 0;

  const numericColumns = stats.filter(s => s.mean !== undefined).map(s => s.column);

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
        
        {originalData.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-400">
                  {filteredData.length} / {originalData.length} satır gösteriliyor
                </p>
              </div>
                  <ExportButtons 
      data={filteredData} 
      stats={stats} 
      filename={`veri_analiz_${new Date().toISOString().slice(0,19)}`} 
    />
              <ColumnFilter 
                data={originalData} 
                columns={headers} 
                onFilter={handleFilter} 
              />
            </div>
            
            {numericColumns.length >= 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grafik Sütunlarını Seçin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            {stats.length > 0 && <StatisticsPanel stats={stats} />}
            
            <DataTable data={filteredData} headers={headers} />
          </div>
        )}
      </div>
    </main>
  );
}