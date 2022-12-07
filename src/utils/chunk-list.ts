/**
 * Returns a list of the items grouped into sub-lists based on the presence of delimiters. Delimiters can be excluded from the returned items.
 * @param items The list of items to "chunk"
 * @param isDelimiter Returns true if the given list item indicates a delimiter between chunks
 * @param includeDelimiters (false) Whether delimiters should be included, as the first item in each chunk
 */
export function chunkList<T>(
  items: T[],
  isDelimiter: (item: T) => boolean,
  includeDelimiters: boolean = false
): T[][] {
  const chunks = [[]];
  items.forEach((item) => {
    const isDelim = isDelimiter(item);
    if (isDelim && chunks[chunks.length - 1].length > 0) {
      chunks.push([]);
    }
    if (!isDelim || includeDelimiters) {
      chunks[chunks.length - 1].push(item);
    }
  });
  return chunks;
}
