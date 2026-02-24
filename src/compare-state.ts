export const COMPARE_QUERY_KEY = 'c';
export const COMPARE_STORAGE_KEY = 'factbook.compare.codes';
export const MAX_COMPARE = 10;

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function parseQueryToList(search: string): string[] {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const seen = new Set<string>();
  const list: string[] = [];
  for (const raw of params.getAll(COMPARE_QUERY_KEY)) {
    const code = normalizeCode(raw);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    list.push(code);
    if (list.length >= MAX_COMPARE) break;
  }
  return list;
}

export function listToQuery(list: string[]): string {
  const params = new URLSearchParams();
  list.slice(0, MAX_COMPARE).forEach((code) => params.append(COMPARE_QUERY_KEY, normalizeCode(code)));
  return params.toString();
}

export function addCountry(list: string[], code: string): string[] {
  const normalized = normalizeCode(code);
  if (!normalized || list.includes(normalized) || list.length >= MAX_COMPARE) return list;
  return [...list, normalized];
}

export function removeCountry(list: string[], code: string): string[] {
  const normalized = normalizeCode(code);
  return list.filter((item) => item !== normalized);
}

export function clearAll(): string[] {
  return [];
}

export function reorderCountry(list: string[], fromIndex: number, toIndex: number): string[] {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
