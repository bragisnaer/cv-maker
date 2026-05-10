/**
 * Deep-merge override into base. Arrays replace, plain objects merge.
 * Used by JSON import so missing fields fall back to the seed shape.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override == null) return base;
  if (typeof base !== 'object' || typeof override !== 'object') return override as T;
  if (Array.isArray(override)) return override as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const k of Object.keys(override as Record<string, unknown>)) {
    const o = (override as Record<string, unknown>)[k];
    out[k] = k in (base as Record<string, unknown>)
      ? deepMerge((base as Record<string, unknown>)[k], o)
      : o;
  }
  return out as T;
}

/**
 * Immutable update at a nested path. Returns a new root.
 */
export function setPath<T>(obj: T, path: (string | number)[], value: unknown): T {
  if (path.length === 0) return value as T;
  const root: unknown = Array.isArray(obj) ? (obj as unknown[]).slice() : { ...(obj as object) };
  let cur: Record<string | number, unknown> = root as Record<string | number, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const child = cur[k];
    cur[k] = Array.isArray(child) ? child.slice() : { ...(child as object) };
    cur = cur[k] as Record<string | number, unknown>;
  }
  cur[path[path.length - 1]] = value;
  return root as T;
}

/**
 * Read a nested value at `path` from `obj`, returning undefined if any
 * intermediate key is missing or not an object/array.
 */
export function readPath(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string | number, unknown>)[k];
  }
  return cur;
}

export function classNames(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(' ');
}

export function uid(prefix = ''): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}${crypto.randomUUID()}`;
  }
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
