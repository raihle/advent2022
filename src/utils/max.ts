export function max(items: any[]): number {
  return items.reduce((acc, next) => (acc >= next ? acc : next));
}
