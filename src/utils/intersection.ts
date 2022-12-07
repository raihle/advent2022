export function intersection<T>(items: T[][]): T[] {
  return [
    ...new Set(
      items.reduce((acc, next) => {
        return acc.filter((item) => next.includes(item));
      })
    ),
  ];
}
