// Numeric id parsing helpers to avoid accidental NaN and enforce positive integers

export function parseNumericId(input: unknown): number | null {
  if (typeof input === 'number' && Number.isInteger(input) && input > 0) return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) return null;
    return num;
  }
  return null;
}

export function parseIdFromRequestUrl(url: string): number | null {
  try {
    const u = new URL(url);
    // Allow using ?id=123 as a fallback
    const byQuery = u.searchParams.get('id');
    const fromQuery = parseNumericId(byQuery);
    if (fromQuery) return fromQuery;
    // Try last path segment
    const segments = u.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return parseNumericId(last);
  } catch {
    return null;
  }
}
