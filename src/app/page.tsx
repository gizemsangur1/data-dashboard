'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import { calculateStatistics } from '@/utils/statistics';
import { Statistics } from '@/utils/types';

interface DataRow {
  [key: string]: string | number;
}

export default function Home() {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [stats, setStats] = useState<Statistics[]>([]);

  const handleDataLoaded = (loadedData: DataRow[], loadedHeaders: string[]) => {
    setData(loadedData);
    setHeaders(loadedHeaders);
    
    const calculatedStats = calculateStatistics(loadedData, loadedHeaders);
    setStats(calculatedStats);
    
    console.log('Yüklenen veri:', loadedData);
    console.log('Sütunlar:', loadedHeaders);
    console.log('İstatistikler:', calculatedStats);
  };

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
            
            {stats.length > 0 && <StatisticsPanel stats={stats} />}
            
            <DataTable data={data} headers={headers} />
          </div>
        )}
      </div>
    </main>
  );
}