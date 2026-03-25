'use client';

import { useState } from 'react';
import { Calculator, X, Check, AlertCircle } from 'lucide-react';

interface DataTransformerProps {
  data: Record<string, string | number>[];
  onDataUpdate: (newData: Record<string, string | number>[]) => void;
}

type TransformType = 'log' | 'normalize' | 'standardize';

export default function DataTransformer({ data, onDataUpdate }: DataTransformerProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [transformType, setTransformType] = useState<TransformType>('normalize');

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

  const calculateStats = (col: string) => {
    const values = data
      .map(row => row[col])
      .filter(v => typeof v === 'number') as number[];
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { mean, std, min, max };
  };

  const applyLogTransform = (value: number): number => {
    if (value <= 0) return 0;
    return Math.log(value);
  };

  const applyNormalize = (value: number, min: number, max: number): number => {
    if (max === min) return 0;
    return (value - min) / (max - min);
  };

  const applyStandardize = (value: number, mean: number, std: number): number => {
    if (std === 0) return 0;
    return (value - mean) / std;
  };

  const applyTransform = () => {
    let newData = [...data];
    
    selectedColumns.forEach(col => {
      const stats = calculateStats(col);
      
      newData = newData.map(row => {
        const value = row[col];
        if (typeof value !== 'number') return row;
        
        let transformed: number;
        switch (transformType) {
          case 'log':
            transformed = applyLogTransform(value);
            break;
          case 'normalize':
            transformed = applyNormalize(value, stats.min, stats.max);
            break;
          case 'standardize':
            transformed = applyStandardize(value, stats.mean, stats.std);
            break;
          default:
            transformed = value;
        }
        
        return { ...row, [col]: transformed };
      });
    });
    
    onDataUpdate(newData);
    setShowPanel(false);
    setSelectedColumns(new Set());
  };

  const getTransformDescription = () => {
    switch (transformType) {
      case 'log':
        return 'Doğal logaritma dönüşümü (ln(x)). Pozitif değerler için uygundur.';
      case 'normalize':
        return 'Veriyi 0-1 aralığına ölçekler. (x - min) / (max - min)';
      case 'standardize':
        return 'Veriyi ortalama=0, standart sapma=1 olacak şekilde ölçekler. (x - mean) / std';
      default:
        return '';
    }
  };

  const getPreviewValue = (col: string, value: number): string => {
    const stats = calculateStats(col);
    switch (transformType) {
      case 'log':
        return applyLogTransform(value).toFixed(4);
      case 'normalize':
        return applyNormalize(value, stats.min, stats.max).toFixed(4);
      case 'standardize':
        return applyStandardize(value, stats.mean, stats.std).toFixed(4);
      default:
        return value.toFixed(4);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm"
      >
        <Calculator className="h-4 w-4" />
        <span>Veri Dönüşümü</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Veri Dönüşümü
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
                  Dönüşüm Tipi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'normalize', label: 'Normalizasyon (0-1)', color: 'bg-green-500' },
                    { id: 'standardize', label: 'Standardizasyon (Z-Score)', color: 'bg-blue-500' },
                    { id: 'log', label: 'Log Dönüşümü', color: 'bg-orange-500' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTransformType(t.id as TransformType)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        transformType === t.id
                          ? `${t.color} text-white`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {getTransformDescription()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Uygulanacak Sütunlar
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 dark:border-gray-700">
                  {numericColumns.map(col => {
                    const sampleValues = data
                      .map(row => row[col])
                      .filter((v): v is number => typeof v === 'number') 
                      .slice(0, 3);
                    
                    return (
                      <label key={col} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColumns.has(col)}
                          onChange={(e) => {
                            const newSet = new Set(selectedColumns);
                            if (e.target.checked) newSet.add(col);
                            else newSet.delete(col);
                            setSelectedColumns(newSet);
                          }}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{col}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Örnek: {sampleValues.map(v => v?.toFixed(2)).join(' → ')}
                            {sampleValues.length > 0 && (
                              <span className="ml-2 text-indigo-500">
                                → {sampleValues.map(v => getPreviewValue(col, v as number)).join(' → ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {transformType === 'log' && 'Not: Log dönüşümü sıfır ve negatif değerler için 0 olarak hesaplanır.'}
                    {transformType === 'normalize' && 'Not: Normalizasyon veriyi 0-1 aralığına ölçekler.'}
                    {transformType === 'standardize' && 'Not: Standardizasyon veriyi ortalama=0, standart sapma=1 olacak şekilde dönüştürür.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={applyTransform}
                  disabled={selectedColumns.size === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedColumns.size > 0
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Dönüşümü Uygula ({selectedColumns.size} sütun)
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