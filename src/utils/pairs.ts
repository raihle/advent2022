/**
 * Creates a list of pairs from an array by combining subsequent items.
 * E.g. [a, b, c] becomes [[a, b], [b, c]]
 */
export function pairs<T>(items: T[]): [T, T][] {
  const pairs = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i > 0) {
      pairs[pairs.length - 1].push(item);
    }
    if (i < items.length - 1) {
      pairs.push([item]);
    }
  }
  return pairs;
}
