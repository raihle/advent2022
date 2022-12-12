export function product(numbers: number[]): number {
  return numbers.reduce((acc, next) => acc * next, 1);
}
