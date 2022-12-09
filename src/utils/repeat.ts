export function repeat(n: number, fn: (time: number) => void) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}
