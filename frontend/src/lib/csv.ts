// Spreadsheet programs interpret formula prefixes, even in quoted CSV cells.
export function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function createCsv(rows: unknown[][]) { return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n'); }
export function downloadCsv(filename: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([createCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
