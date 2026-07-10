/**
 * Escapes a single CSV cell: guards against CSV/formula injection (a leading
 * =, +, -, or @ is interpreted as a formula by Excel/Sheets when the file is
 * later opened) and quotes the value if it contains a comma, quote, or newline.
 */
function escapeCsvCell(value: string): string {
  const sanitized = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(sanitized)) return `"${sanitized.replace(/"/g, '""')}"`;
  return sanitized;
}

/** Builds CSV text from a header row and an array of row-cell arrays. */
export function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(row.map((v) => escapeCsvCell(String(v))).join(","));
  }
  return lines.join("\n");
}

/** Triggers a browser download of the given text content as a file. */
export function downloadTextFile(content: string, filename: string, mimeType = "text/csv;charset=utf-8;"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
