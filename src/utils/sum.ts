export function sum(numbers: number[]): number {
  return numbers.reduce((acc, next) => acc + next, 0);
}
