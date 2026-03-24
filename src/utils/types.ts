export interface DataRow {
  [key: string]: string | number;
}

export interface Column {
  name: string;
  type: 'string' | 'number' | 'date';
  uniqueValues?: number;
}

export interface Statistics {
  column: string;
  count: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  std?: number;
  unique?: number;
  missing?: number;
}

export type Operator = 'equals' | 'contains' | 'greater' | 'less' | 'between';

export interface FilterState {
  column: string;
  operator: Operator;
  value: string | number;
  value2?: string | number;
}