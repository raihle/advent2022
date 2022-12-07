export async function test() {
  main(["2-4,6-8", "2-3,4-5", "5-7,7-9", "2-8,3-7", "6-6,4-6", "2-6,4-8"]);
}
export async function main(input: string[]) {
  console.log("A: ", input.filter(rangesOverlapFully).length);
  console.log("B: ", input.filter(rangesOverlap).length);
}

function rangesOverlapFully(ranges: string) {
  const [[a1, a2], [b1, b2]] = parseRanges(ranges);
  return (a1 <= b1 && a2 >= b2) || (b1 <= a1 && b2 >= a2);
}

function rangesOverlap(ranges: string) {
  const [[a1, a2], [b1, b2]] = parseRanges(ranges);
  return a1 <= b2 && a2 >= b1;
}

function parseRanges(ranges: string) {
  const [a, b] = ranges.split(",");
  return [a.split("-").map(Number), b.split("-").map(Number)];
}
