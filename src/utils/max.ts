export function max<T>(items: T[]): T {
  return items.reduce((acc, next) => (acc >= next ? acc : next));
}
