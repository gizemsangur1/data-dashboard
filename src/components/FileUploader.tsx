'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface FileUploaderProps {
  onDataLoaded: (data: Record<string, string | number>[], headers: string[]) => void;
}

export default function FileUploader({ onDataLoaded }: FileUploaderProps) {
  const processFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = Object.keys(result.data[0] || {});
          onDataLoaded(result.data as Record<string, string | number>[], headers);
        },
        error: (error) => {
          console.error('CSV okuma hatası:', error);
          alert('CSV dosyası okunurken bir hata oluştu.');
        }
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const headers = Object.keys(jsonData[0] || {});
        onDataLoaded(jsonData as Record<string, string | number>[], headers);
      };
      reader.onerror = () => {
        alert('Excel dosyası okunurken bir hata oluştu.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Lütfen CSV veya Excel dosyası yükleyin.');
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-all
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' 
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <Upload className={`h-12 w-12 sm:h-16 sm:w-16 ${isDragActive ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} />
        
        <div className="space-y-1 sm:space-y-2">
          <p className="text-base sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Dosyayı bırakın' : 'CSV veya Excel dosyası yükleyin'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Sürükleyip bırakın veya tıklayarak seçin
          </p>
        </div>
        
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>.csv</span>
          </div>
          <div className="flex items-center gap-1">
            <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>.xlsx, .xls</span>
          </div>
        </div>
      </div>
    </div>
  );
}