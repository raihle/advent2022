export function take<T>(amount: number, items: T[]): T[] {
  return items.slice(0, amount);
}
