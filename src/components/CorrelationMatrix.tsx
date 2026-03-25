'use client';

import { useState } from 'react';
import { Grid, X, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateCorrelation } from '@/utils/statistics';

interface CorrelationMatrixProps {
  data: Record<string, string | number>[];
}

export default function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const [showPanel, setShowPanel] = useState(false);

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

  const correlationMatrix: Record<string, Record<string, number>> = {};
  
  numericColumns.forEach(col1 => {
    correlationMatrix[col1] = {};
    numericColumns.forEach(col2 => {
      if (col1 === col2) {
        correlationMatrix[col1][col2] = 1;
      } else {
        correlationMatrix[col1][col2] = calculateCorrelation(data, col1, col2);
      }
    });
  });

  const getColorForCorrelation = (corr: number) => {
    const intensity = Math.abs(corr);
    if (corr > 0) {
      return `rgba(34, 197, 94, ${intensity * 0.8})`;
    } else if (corr < 0) {
      return `rgba(239, 68, 68, ${intensity * 0.8})`;
    }
    return 'rgba(156, 163, 175, 0.3)';
  };

  const getTextColor = (corr: number) => {
    return Math.abs(corr) > 0.5 ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  };

  const exportToCSV = () => {
    const headers = ['', ...numericColumns];
    const rows = numericColumns.map(col1 => [
      col1,
      ...numericColumns.map(col2 => correlationMatrix[col1][col2].toFixed(3))
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'korelasyon_matrisi.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
        title="Korelasyon Matrisi"
      >
        <Grid className="h-5 w-5" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Korelasyon Matrisi
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="CSV olarak dışa aktar"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              {numericColumns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Korelasyon hesaplamak için yeterli sayısal sütun bulunamadı.
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 opacity-80 rounded"></div>
                      <span className="text-xs">Pozitif Korelasyon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 opacity-80 rounded"></div>
                      <span className="text-xs">Negatif Korelasyon</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="sticky left-0 bg-white dark:bg-gray-800 p-2"></th>
                          {numericColumns.map(col => (
                            <th key={col} className="p-2 font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {numericColumns.map(col1 => (
                          <tr key={col1}>
                            <th className="sticky left-0 bg-white dark:bg-gray-800 p-2 font-medium text-gray-700 dark:text-gray-300 text-left">
                              {col1}
                            </th>
                            {numericColumns.map(col2 => {
                              const corr = correlationMatrix[col1][col2];
                              const bgColor = getColorForCorrelation(corr);
                              return (
                                <td
                                  key={`${col1}-${col2}`}
                                  className="p-2 text-center"
                                  style={{ backgroundColor: bgColor }}
                                >
                                  <span className={getTextColor(corr)}>
                                    {corr.toFixed(3)}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-2">Korelasyon Yorumu</h3>
                    <div className="space-y-1 text-sm">
                      {numericColumns.map(col1 => {
                        const positiveCorrelations = numericColumns
                          .filter(col2 => col1 !== col2 && correlationMatrix[col1][col2] > 0.7)
                          .map(col2 => ({
                            col: col2,
                            corr: correlationMatrix[col1][col2]
                          }));
                        
                        const negativeCorrelations = numericColumns
                          .filter(col2 => col1 !== col2 && correlationMatrix[col1][col2] < -0.7)
                          .map(col2 => ({
                            col: col2,
                            corr: correlationMatrix[col1][col2]
                          }));
                        
                        if (positiveCorrelations.length === 0 && negativeCorrelations.length === 0) return null;
                        
                        return (
                          <p key={col1} className="flex flex-wrap gap-2">
                            <span className="font-medium">{col1}:</span>
                            {positiveCorrelations.map(({ col, corr }) => (
                              <span key={col} className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                {col} (+{corr.toFixed(2)})
                              </span>
                            ))}
                            {negativeCorrelations.map(({ col, corr }) => (
                              <span key={col} className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                                <TrendingDown className="h-3 w-3 text-red-600" />
                                {col} ({corr.toFixed(2)})
                              </span>
                            ))}
                          </p>
                        );
                      }).filter(Boolean)}
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