'use client';

import { useState } from 'react';
import { Beaker, X, Calculator } from 'lucide-react';

interface StatisticalTestsProps {
  data: Record<string, string | number>[];
}

type TestType = 'ttest' | 'anova' | 'chisquare';

export default function StatisticalTests({ data }: StatisticalTestsProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [testType, setTestType] = useState<TestType>('ttest');
  const [selectedNumericColumn, setSelectedNumericColumn] = useState<string>('');
  const [selectedCategoricalColumn, setSelectedCategoricalColumn] = useState<string>('');
  const [result, setResult] = useState<{ statistic: number; pValue: number; interpretation: string } | null>(null);

  const numericColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]).filter(v => typeof v === 'number');
    return values.length > 0;
  });

  const categoricalColumns = Object.keys(data[0] || {}).filter(col => {
    const values = data.map(row => row[col]?.toString()).filter(v => v);
    const uniqueCount = new Set(values).size;
    return uniqueCount >= 2 && uniqueCount <= 10 && values.length > 0;
  });

  const calculateTTest = (col: string, groupCol: string) => {
    const groups: Record<string, number[]> = {};
    
    data.forEach(row => {
      const group = row[groupCol]?.toString();
      const value = row[col];
      if (group && typeof value === 'number') {
        if (!groups[group]) groups[group] = [];
        groups[group].push(value);
      }
    });

    const groupNames = Object.keys(groups);
    if (groupNames.length !== 2) return null;

    const group1 = groups[groupNames[0]];
    const group2 = groups[groupNames[1]];
    
    const mean1 = group1.reduce((a, b) => a + b, 0) / group1.length;
    const mean2 = group2.reduce((a, b) => a + b, 0) / group2.length;
    
    const var1 = group1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / (group1.length - 1);
    const var2 = group2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / (group2.length - 1);
    
    const se = Math.sqrt(var1 / group1.length + var2 / group2.length);
    const tStat = (mean1 - mean2) / se;
    
    const df = group1.length + group2.length - 2;
    const pValue = 2 * (1 - studentTDistribution(Math.abs(tStat), df));
    
    return {
      statistic: tStat,
      pValue,
      interpretation: pValue < 0.05 
        ? `İki grup arasında anlamlı fark var (p = ${pValue.toFixed(4)})`
        : `İki grup arasında anlamlı fark yok (p = ${pValue.toFixed(4)})`
    };
  };

  const calculateANOVA = (col: string, groupCol: string) => {
    const groups: Record<string, number[]> = {};
    
    data.forEach(row => {
      const group = row[groupCol]?.toString();
      const value = row[col];
      if (group && typeof value === 'number') {
        if (!groups[group]) groups[group] = [];
        groups[group].push(value);
      }
    });

    const groupNames = Object.keys(groups);
    if (groupNames.length < 2) return null;
    
    const allValues: number[] = [];
    const groupMeans: Record<string, number> = {};
    const groupSizes: Record<string, number> = {};
    
    groupNames.forEach(group => {
      const values = groups[group];
      groupSizes[group] = values.length;
      groupMeans[group] = values.reduce((a, b) => a + b, 0) / values.length;
      allValues.push(...values);
    });
    
    const grandMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    
    let ssBetween = 0;
    let ssWithin = 0;
    
    groupNames.forEach(group => {
      const size = groupSizes[group];
      const mean = groupMeans[group];
      ssBetween += size * Math.pow(mean - grandMean, 2);
      
      groups[group].forEach(value => {
        ssWithin += Math.pow(value - mean, 2);
      });
    });
    
    const dfBetween = groupNames.length - 1;
    const dfWithin = allValues.length - groupNames.length;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStat = msBetween / msWithin;
    
    const pValue = fDistribution(fStat, dfBetween, dfWithin);
    
    return {
      statistic: fStat,
      pValue,
      interpretation: pValue < 0.05
        ? `Gruplar arasında anlamlı fark var (p = ${pValue.toFixed(4)})`
        : `Gruplar arasında anlamlı fark yok (p = ${pValue.toFixed(4)})`
    };
  };

  const calculateChiSquare = (col1: string, col2: string) => {
    const contingency: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let total = 0;
    
    data.forEach(row => {
      const val1 = row[col1]?.toString();
      const val2 = row[col2]?.toString();
      if (val1 && val2) {
        if (!contingency[val1]) contingency[val1] = {};
        contingency[val1][val2] = (contingency[val1][val2] || 0) + 1;
        rowTotals[val1] = (rowTotals[val1] || 0) + 1;
        colTotals[val2] = (colTotals[val2] || 0) + 1;
        total++;
      }
    });
    
    let chiSquare = 0;
    const rows = Object.keys(contingency);
    const cols = Object.keys(colTotals);
    
    rows.forEach(row => {
      cols.forEach(col => {
        const observed = contingency[row]?.[col] || 0;
        const expected = (rowTotals[row] * (colTotals[col] || 0)) / total;
        if (expected > 0) {
          chiSquare += Math.pow(observed - expected, 2) / expected;
        }
      });
    });
    
    const df = (rows.length - 1) * (cols.length - 1);
    const pValue = chiSquareDistribution(chiSquare, df);
    
    return {
      statistic: chiSquare,
      pValue,
      interpretation: pValue < 0.05
        ? `İki değişken arasında ilişki var (p = ${pValue.toFixed(4)})`
        : `İki değişken arasında ilişki yok (p = ${pValue.toFixed(4)})`
    };
  };

const studentTDistribution = (t: number, df: number): number => {
  const x = df / (df + t * t);
  let betaInc = 0;
  for (let i = 0; i < 100; i++) {
    betaInc += Math.pow(x, i) * (1 - x);
  }
  return Math.min(Math.max(betaInc / 2, 0), 1);
};

const fDistribution = (f: number, df1: number, df2: number): number => {
  const x = df2 / (df2 + df1 * f);
  return Math.min(Math.max(Math.pow(x, df2 / 2), 0.001), 0.999);
};

const chiSquareDistribution = (chi2: number, df: number): number => {
  let p = Math.exp(-chi2 / 2);
  let term = p;
  for (let i = 1; i <= df / 2; i++) {
    term *= chi2 / (2 * i);
    p += term;
  }
  return Math.min(Math.max(1 - p, 0.001), 0.999);
};

  const runTest = () => {
    if (testType === 'ttest' && selectedNumericColumn && selectedCategoricalColumn) {
      const result = calculateTTest(selectedNumericColumn, selectedCategoricalColumn);
      if (result) setResult(result);
    } else if (testType === 'anova' && selectedNumericColumn && selectedCategoricalColumn) {
      const result = calculateANOVA(selectedNumericColumn, selectedCategoricalColumn);
      if (result) setResult(result);
    } else if (testType === 'chisquare' && selectedCategoricalColumn) {
      const categoricalCols = categoricalColumns.filter(c => c !== selectedCategoricalColumn);
      if (categoricalCols.length > 0) {
        const result = calculateChiSquare(selectedCategoricalColumn, categoricalCols[0]);
        if (result) setResult(result);
      }
    }
  };

  const getTestDescription = () => {
    switch (testType) {
      case 'ttest':
        return 'İki grup ortalaması arasında istatistiksel olarak anlamlı fark olup olmadığını test eder.';
      case 'anova':
        return 'Üç veya daha fazla grup ortalaması arasında anlamlı fark olup olmadığını test eder.';
      case 'chisquare':
        return 'İki kategorik değişken arasında ilişki olup olmadığını test eder.';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(true)}
        className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        title="İstatistiksel Testler"
      >
        <Beaker className="h-5 w-5" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                İstatistiksel Testler
              </h2>
              <button
                onClick={() => setShowPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Tipi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTestType('ttest')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      testType === 'ttest'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    T-Test
                  </button>
                  <button
                    onClick={() => setTestType('anova')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      testType === 'anova'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    ANOVA
                  </button>
                  <button
                    onClick={() => setTestType('chisquare')}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      testType === 'chisquare'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Ki-Kare
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{getTestDescription()}</p>
              </div>

              {(testType === 'ttest' || testType === 'anova') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sayısal Değişken
                    </label>
                    <select
                      value={selectedNumericColumn}
                      onChange={(e) => setSelectedNumericColumn(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                    >
                      <option value="">Seçiniz</option>
                      {numericColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grup Değişkeni (Kategorik)
                    </label>
                    <select
                      value={selectedCategoricalColumn}
                      onChange={(e) => setSelectedCategoricalColumn(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                    >
                      <option value="">Seçiniz</option>
                      {categoricalColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {testType === 'chisquare' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategorik Değişken 1
                  </label>
                  <select
                    value={selectedCategoricalColumn}
                    onChange={(e) => setSelectedCategoricalColumn(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700"
                  >
                    <option value="">Seçiniz</option>
                    {categoricalColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Ki-kare testi için ikinci kategorik değişken otomatik seçilecektir.
                  </p>
                </div>
              )}

              <button
                onClick={runTest}
                disabled={
                  (testType !== 'chisquare' && (!selectedNumericColumn || !selectedCategoricalColumn)) ||
                  (testType === 'chisquare' && !selectedCategoricalColumn)
                }
                className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                Testi Çalıştır
              </button>

              {result && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                  <h3 className="font-semibold">Test Sonucu</h3>
                  <p className="text-sm">
                    <span className="font-medium">Test İstatistiği:</span> {result.statistic.toFixed(4)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">p-değeri:</span> {result.pValue.toFixed(4)}
                  </p>
                  <div className={`p-3 rounded-lg mt-2 ${result.pValue < 0.05 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                    <p className="text-sm font-medium">{result.interpretation}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * p-değeri &lt; 0.05 ise sonuç istatistiksel olarak anlamlı kabul edilir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}