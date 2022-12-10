/**
 * Transforms a K-dimensional array into a K+1-dimensional array by combining groups of N items into sub-arrays
 * E.g. group(2, [a, b, c, d, e, f]) => [[a, b], [c, d], [e, f]]
 */
export function group<T>(groupSize: number, items: T[]): T[][] {
  return items.reduce((acc, item, i) => {
    if (i % groupSize == 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(item);
    return acc;
  }, []);
}
