'use client';

import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface MissingDataHandlerProps {
  data: Record<string, string | number>[];
  onDataUpdate: (newData: Record<string, string | number>[]) => void;
}

type Strategy = 'remove' | 'mean' | 'median' | 'mode';

export default function MissingDataHandler({ data, onDataUpdate }: MissingDataHandlerProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [strategy, setStrategy] = useState<Strategy>('mean');

  const columns = Object.keys(data[0] || {});
  
  const getMissingStats = () => {
    const stats: Record<string, { count: number; percentage: number }> = {};
    columns.forEach(col => {
      const missing = data.filter(row => row[col] === undefined || row[col] === null || row[col] === '').length;
      stats[col] = {
        count: missing,
        percentage: (missing / data.length) * 100
      };
    });
    return stats;
  };

  const missingStats = getMissingStats();
  const hasMissing = Object.values(missingStats).some(s => s.count > 0);

  const calculateMean = (col: string) => {
    const values = data
      .map(row => row[col])
      .filter(v => v !== undefined && v !== null && v !== '' && typeof v === 'number') as number[];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const calculateMedian = (col: string) => {
    const values = data
      .map(row => row[col])
      .filter(v => v !== undefined && v !== null && v !== '' && typeof v === 'number') as number[];
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const calculateMode = (col: string) => {
    const values = data
      .map(row => row[col])
      .filter(v => v !== undefined && v !== null && v !== '');
    if (values.length === 0) return '';
    const freq: Record<string, number> = {};
    values.forEach(v => {
      const key = v?.toString() || '';
      freq[key] = (freq[key] || 0) + 1;
    });
    const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return mode ? mode[0] : '';
  };

  const applyMissingDataHandler = () => {
    let newData = [...data];
    
    selectedColumns.forEach(col => {
      const missingIndices = newData.reduce((indices, row, idx) => {
        if (row[col] === undefined || row[col] === null || row[col] === '') {
          indices.push(idx);
        }
        return indices;
      }, [] as number[]);

      if (missingIndices.length === 0) return;

      if (strategy === 'remove') {
        newData = newData.filter((_, idx) => !missingIndices.includes(idx));
      } else {
        let fillValue: string | number = '';
        if (strategy === 'mean') fillValue = calculateMean(col);
        else if (strategy === 'median') fillValue = calculateMedian(col);
        else if (strategy === 'mode') fillValue = calculateMode(col);
        
        missingIndices.forEach(idx => {
          newData[idx] = { ...newData[idx], [col]: fillValue };
        });
      }
    });

    onDataUpdate(newData);
    setShowPanel(false);
  };

  if (!hasMissing) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Eksik Veriler Var!</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Eksik Veri Yönetimi
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
                  İşlem Stratejisi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['remove', 'mean', 'median', 'mode'] as Strategy[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        strategy === s
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {s === 'remove' && 'Sil'}
                      {s === 'mean' && 'Ortalama'}
                      {s === 'median' && 'Medyan'}
                      {s === 'mode' && 'Mod (En Sık)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uygulanacak Sütunlar
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 dark:border-gray-700">
                  {columns.map(col => {
                    const stats = missingStats[col];
                    if (stats.count === 0) return null;
                    return (
                      <label key={col} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColumns.has(col)}
                          onChange={(e) => {
                            const newSet = new Set(selectedColumns);
                            if (e.target.checked) newSet.add(col);
                            else newSet.delete(col);
                            setSelectedColumns(newSet);
                          }}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">{col}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({stats.count} eksik, %{stats.percentage.toFixed(1)})
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={applyMissingDataHandler}
                  disabled={selectedColumns.size === 0}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Check className="h-4 w-4 inline mr-2" />
                  Uygula
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}