export type Row = { id: number; key: string; value: string };
let counter = 1;
export const newRow = (key = "", value = ""): Row => ({
  id: counter++,
  key,
  value,
});
export const recordToRows = (record: Record<string, string>): Row[] =>
  Object.entries(record).map(([key, value]) => newRow(key, value));
export function rowsToRecord(rows: Row[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, value } of rows) {
    const clean = key.trim();
    if (clean) out[clean] = value.trim();
  }
  return out;
}
export function duplicateLabels(rows: Row[]): Set<string> {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const { key } of rows) {
    const clean = key.trim().toLowerCase();
    if (!clean) continue;
    if (seen.has(clean)) dupes.add(clean);
    seen.add(clean);
  }
  return dupes;
}
