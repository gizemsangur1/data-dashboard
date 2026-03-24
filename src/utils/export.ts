import * as XLSX from 'xlsx';
import { Statistics } from './types';

interface DataRow {
  [key: string]: string | number;
}

export const exportToCSV = (data: DataRow[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]?.toString() || '';
      return JSON.stringify(value);
    });
    csvRows.push(values.join(','));
  }
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToExcel = (data: DataRow[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = async (data: DataRow[], filename: string, stats: Statistics[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stats-table { width: auto; margin-bottom: 30px; }
        .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Veri Analiz Raporu</h1>
      <p><strong>Dosya:</strong> ${filename}</p>
      <p><strong>Oluşturulma tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
      <p><strong>Toplam kayıt:</strong> ${data.length}</p>
      
      <h2>İstatistiksel Özet</h2>
      <table class="stats-table">
        <thead>
          <tr>
            <th>Sütun</th>
            <th>Kayıt Sayısı</th>
            <th>Eksik Veri</th>
            <th>Unique</th>
            <th>Ortalama</th>
            <th>Min</th>
            <th>Max</th>
            <th>Std. Sapma</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map(stat => `
            <tr>
              <td><strong>${stat.column}</strong></td>
              <td>${stat.count}</td>
              <td>${stat.missing || 0}</td>
              <td>${stat.unique || 0}</td>
              <td>${stat.mean ? stat.mean.toFixed(2) : '-'}</td>
              <td>${stat.min ? stat.min.toFixed(2) : '-'}</td>
              <td>${stat.max ? stat.max.toFixed(2) : '-'}</td>
              <td>${stat.std ? stat.std.toFixed(2) : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h2>Veri Tablosu (İlk 100 Satır)</h2>
      <table>
        <thead>
          <tr>
            ${Object.keys(data[0] || {}).map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.slice(0, 100).map(row => `
            <tr>
              ${Object.values(row).map(value => `<td>${value !== undefined && value !== null ? value : '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${data.length > 100 ? '<p><em>Not: Sadece ilk 100 satır gösterilmektedir.</em></p>' : ''}
      <div class="footer">
        <p>Veri Analiz Dashboard tarafından oluşturulmuştur.</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};