/**
 * A copy of `source` holding only the listed fields that are not `undefined`
 * (a `null` is kept: it empties the field).
 */
export function pickDefined<T, K extends keyof T>(
  source: T,
  fields: readonly K[],
): Partial<Pick<T, K>> {
  const picked: Partial<Pick<T, K>> = {};
  for (const field of fields) {
    if (source[field] !== undefined) {
      picked[field] = source[field];
    }
  }
  return picked;
}

/**
 * The listed fields that `source` has with another value than `stored`.
 * Compared loosely: a number sent as text is the same value.
 */
export function differingFields(
  source: Record<string, any>,
  stored: Record<string, any>,
  fields: readonly string[],
): string[] {
  return fields.filter(
    (field) => source[field] !== undefined && source[field] != stored[field],
  );
}
