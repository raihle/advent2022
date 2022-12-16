/**
 * Returns a list of the items grouped into sub-lists based on the presence of delimiters. Delimiters can be excluded from the returned items.
 * @param items The list of items to "chunk"
 * @param isDelimiter Returns true if the given list item indicates a delimiter between chunks
 * @param includeDelimiters (false) Whether delimiters should be included, as the first item in each chunk
 */
export function mapBy<T, K extends keyof T>(
  property: K,
  list: T[]
): Map<T[K], T> {
  const items = new Map<T[K], T>();
  list.forEach((item) => {
    items.set(item[property], item);
  });
  return items;
}
