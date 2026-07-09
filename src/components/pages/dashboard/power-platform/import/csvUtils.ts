/** Minimal CSV header parser — splits the first line on commas, respecting simple quoted fields. */
export function parseCsvHeaders(text: string): string[] {
  const firstLine = text.split(/\r\n|\n|\r/)[0] ?? "";
  const headers: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      headers.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  headers.push(current.trim());
  return headers.filter(Boolean);
}
