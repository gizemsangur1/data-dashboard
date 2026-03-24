import { DataRow, Statistics } from './types';

export function calculateStatistics(data: DataRow[], columns: string[]): Statistics[] {
  const stats: Statistics[] = [];

  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined);
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    
    const stat: Statistics = {
      column,
      count: values.length,
      missing: data.length - values.length,
      unique: new Set(values).size,
    };

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      stat.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      stat.median = sorted[Math.floor(sorted.length / 2)];
      stat.min = Math.min(...numericValues);
      stat.max = Math.max(...numericValues);
      
      const mean = stat.mean;
      const squaredDiffs = numericValues.map(v => Math.pow(v - mean, 2));
      stat.std = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / numericValues.length);
    }

    stats.push(stat);
  });

  return stats;
}

export function calculateCorrelation(data: DataRow[], col1: string, col2: string): number {
  const values1 = data.map(row => row[col1]).filter(v => typeof v === 'number') as number[];
  const values2 = data.map(row => row[col2]).filter(v => typeof v === 'number') as number[];
  
  const n = Math.min(values1.length, values2.length);
  if (n === 0) return 0;
  
  const mean1 = values1.reduce((a, b) => a + b, 0) / n;
  const mean2 = values2.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }
  
  return numerator / Math.sqrt(denom1 * denom2);
}