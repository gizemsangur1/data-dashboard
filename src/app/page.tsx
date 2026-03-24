'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import Charts from '@/components/Charts';
import { calculateStatistics, calculateCorrelation } from '@/utils/statistics';
import { Statistics } from '@/utils/types';

interface DataRow {
  [key: string]: string | number;
}

export default function Home() {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [stats, setStats] = useState<Statistics[]>([]);
  const [selectedXColumn, setSelectedXColumn] = useState<string>('');
  const [selectedYColumn, setSelectedYColumn] = useState<string>('');

  const handleDataLoaded = (loadedData: DataRow[], loadedHeaders: string[]) => {
    setData(loadedData);
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

  const correlation = selectedXColumn && selectedYColumn && selectedXColumn !== selectedYColumn
    ? calculateCorrelation(data, selectedXColumn, selectedYColumn)
    : 0;

  const numericColumns = stats.filter(s => s.mean !== undefined).map(s => s.column);

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Veri Analiz Dashboard
          </h1>
          <p className="text-gray-600">
            CSV veya Excel dosyası yükleyerek verilerinizi analiz edin
          </p>
        </div>
        
        {data.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">
                {data.length} satır ve {headers.length} sütun başarıyla yüklendi!
              </p>
            </div>
            
            {numericColumns.length >= 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Grafik Sütunlarını Seçin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X Ekseni
                    </label>
                    <select
                      value={selectedXColumn}
                      onChange={(e) => setSelectedXColumn(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {numericColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Y Ekseni
                    </label>
                    <select
                      value={selectedYColumn}
                      onChange={(e) => setSelectedYColumn(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                data={data}
                xColumn={selectedXColumn}
                yColumn={selectedYColumn}
                correlation={correlation}
              />
            )}
            
            {stats.length > 0 && <StatisticsPanel stats={stats} />}
            
            <DataTable data={data} headers={headers} />
          </div>
        )}
      </div>
    </main>
  );
}