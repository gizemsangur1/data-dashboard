'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';

interface DataRow {
  [key: string]: string | number;
}

export default function Home() {
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const handleDataLoaded = (loadedData: DataRow[], loadedHeaders: string[]) => {
    setData(loadedData);
    setHeaders(loadedHeaders);
    console.log('Yüklenen veri:', loadedData);
    console.log('Sütunlar:', loadedHeaders);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">
                 {data.length} satır ve {headers.length} sütun başarıyla yüklendi!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}