'use client';

import { FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/export';
import { Statistics } from '@/utils/types';

interface DataRow {
  [key: string]: string | number;
}

interface ExportButtonsProps {
  data: DataRow[];
  stats: Statistics[];
  filename: string;
}

export default function ExportButtons({ data, stats, filename }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportToCSV(data, filename)}
        className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
        title="CSV olarak dışa aktar"
      >
        <FileText className="h-4 w-4" />
        <span>CSV</span>
      </button>
      <button
        onClick={() => exportToExcel(data, filename)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
        title="Excel olarak dışa aktar"
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span>Excel</span>
      </button>
      <button
        onClick={() => exportToPDF(data, filename, stats)}
        className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
        title="PDF olarak dışa aktar"
      >
        <FileJson className="h-4 w-4" />
        <span>PDF</span>
      </button>
    </div>
  );
}