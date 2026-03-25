'use client';

import { useState } from 'react';
import { Hash, X, Check, AlertCircle } from 'lucide-react';

interface CategoricalEncoderProps {
  data: Record<string, string | number>[];
  onDataUpdate: (newData: Record<string, string | number>[]) => void;
}

type EncodingType = 'label' | 'onehot';

export default function CategoricalEncoder({ data, onDataUpdate }: CategoricalEncoderProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [encodingType, setEncodingType] = useState<EncodingType>('label');

  const categoricalColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => v !== undefined && v !== null);
    const uniqueValues = new Set(values.map(v => v?.toString()));
    return uniqueValues.size <= 20 && values.length > 0 && typeof values[0] !== 'number';
  });

  const getUniqueValues = (col: string) => {
    const values = data.map(row => row[col]?.toString());
    return [...new Set(values)].filter(v => v !== undefined);
  };

  const applyLabelEncoding = (col: string): Record<string, string | number>[] => {
    const uniqueValues = getUniqueValues(col);
    const mapping: Record<string, number> = {};
    uniqueValues.forEach((value, idx) => {
      mapping[value] = idx;
    });
    
    return data.map(row => ({
      ...row,
      [col]: mapping[row[col]?.toString() || '']
    }));
  };

  const applyOneHotEncoding = (col: string): Record<string, string | number>[] => {
    const uniqueValues = getUniqueValues(col);
    const newColumns: Record<string, number[]> = {};
    
    uniqueValues.forEach(value => {
      const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '_');
      newColumns[`${col}_${cleanValue}`] = data.map(row => 
        row[col]?.toString() === value ? 1 : 0
      );
    });
    
    return data.map((row, idx) => {
      const newRow = { ...row };
      delete newRow[col];
      Object.keys(newColumns).forEach(newCol => {
        newRow[newCol] = newColumns[newCol][idx];
      });
      return newRow;
    });
  };

  const applyEncoding = () => {
    let newData = [...data];
    
    selectedColumns.forEach(col => {
      if (encodingType === 'label') {
        newData = applyLabelEncoding(col);
      } else {
        newData = applyOneHotEncoding(col);
      }
    });
    
    onDataUpdate(newData);
    setShowPanel(false);
    setSelectedColumns(new Set());
  };

  const getEncodingDescription = () => {
    switch (encodingType) {
      case 'label':
        return 'Her kategoriye 0,1,2,... şeklinde sayısal etiket atar. Bellek dostudur ancak sıralama anlamı taşır.';
      case 'onehot':
        return 'Her kategori için ayrı bir sütun oluşturur. 0/1 değerleri alır. Sıralama anlamı taşımaz ancak çok sütun oluşturur.';
      default:
        return '';
    }
  };

  const getPreviewMapping = (col: string) => {
    const uniqueValues = getUniqueValues(col);
    if (encodingType === 'label') {
      return uniqueValues.map((v, i) => `${v} → ${i}`).join(', ');
    } else {
      return uniqueValues.map(v => `${col}_${v.replace(/[^a-zA-Z0-9]/g, '_')} (0/1)`).join(', ');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors text-sm"
      >
        <Hash className="h-4 w-4" />
        <span>Kategorik Dönüşüm</span>
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Kategorik Veri Dönüşümü
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
                  Kodlama Tipi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setEncodingType('label')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      encodingType === 'label'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Label Encoding
                  </button>
                  <button
                    onClick={() => setEncodingType('onehot')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      encodingType === 'onehot'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    One-Hot Encoding
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {getEncodingDescription()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dönüştürülecek Kategorik Sütunlar
                </label>
                {categoricalColumns.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Kategorik sütun bulunamadı. Tüm sütunlar sayısal veya çok fazla benzersiz değer içeriyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 dark:border-gray-700">
                    {categoricalColumns.map(col => {
                      const uniqueCount = getUniqueValues(col).length;
                      
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
                              {uniqueCount} benzersiz değer
                              {encodingType === 'onehot' && uniqueCount > 10 && (
                                <span className="ml-2 text-orange-500">⚠️ {uniqueCount} yeni sütun oluşacak</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate">
                              Önizleme: {getPreviewMapping(col)}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {encodingType === 'label' 
                      ? 'Label encoding kategorik veriyi sayısala çevirir ancak modeller sıralama anlamı çıkarabilir.'
                      : 'One-Hot encoding her kategori için ayrı sütun oluşturur. Çok kategorili sütunlarda veri boyutu artar.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={applyEncoding}
                  disabled={selectedColumns.size === 0 || categoricalColumns.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedColumns.size > 0 && categoricalColumns.length > 0
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