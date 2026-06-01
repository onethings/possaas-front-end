/**
 * 共用匯出工具：CSV 與 PDF (瀏覽器列印)
 */

/**
 * 匯出 CSV
 * @param {Array<{label: string, value: ((row: any) => string|number)}>} columns - 欄位定義
 * @param {Array<any>} data - 資料陣列
 * @param {Array<string>} [footerRow] - 結尾總計行
 * @param {string} filename - 檔名
 */
export function exportCSV(columns, data, footerRow, filename) {
    const header = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            const val = typeof c.value === 'function' ? c.value(row) : row[c.value];
            const str = String(val ?? '');
            // 如果內容包含逗號或引號，用雙引號包起來
            return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
    );
    const csvContent = '\uFEFF' + [header, ...rows, ...(footerRow ? [footerRow.join(',')] : [])].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 匯出 PDF (利用瀏覽器列印功能，生成可列印的 HTML 表格)
 * @param {string} title - 報表標題
 * @param {Array<{label: string}>} columns - 欄位定義
 * @param {Array<any>} data - 資料陣列
 * @param {string} currency - 貨幣符號
 */
export function exportPDF(title, columns, data, currency = '') {
    const headerRow = columns.map(c => `<th style="padding:8px 12px;text-align:left;background:#f0f0f0;font-weight:600;font-size:12px;border:1px solid #ddd;">${c.label}</th>`).join('');

    const bodyRows = data.map((row, idx) => {
        const cells = columns.map(c => {
            const val = typeof c.value === 'function' ? c.value(row) : row[c.value];
            return `<td style="padding:8px 12px;border:1px solid #ddd;font-size:12px;${idx % 2 === 0 ? 'background:#fafafa;' : ''}">${val ?? ''}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; }
  h2 { margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h2>${title}</h2>
  <table>${headerRow}${bodyRows}</table>
  <p style="margin-top:12px;font-size:11px;color:#999;">${new Date().toLocaleString()}</p>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
        }, 500);
    }
}
