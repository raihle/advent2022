export type Range = { first: number; last: number };
export function range(first: number, last: number) {
  return { first, last };
}
export class Ranges {
  private ranges: Range[];
  private needOptimize: boolean;
  constructor() {
    this.ranges = [];
    this.needOptimize = false;
  }
  add(first: number, last: number) {
    this.ranges.push({ first, last });
    this.needOptimize = true;
  }
  contains(num: number) {
    if (this.needOptimize) {
      this.optimize();
    }
    for (const range of this.ranges) {
      if (range.first <= num && range.last >= num) {
        return true;
      }
    }
    return false;
  }
  holes(first: number, last: number): Ranges {
    if (this.needOptimize) {
      this.optimize();
    }
    const holes = new Ranges();
    let acc = first;

    for (const range of this.ranges) {
      if (acc < range.first && acc <= last) {
        holes.add(acc, Math.min(last, range.first - 1));
      }
      acc = range.last + 1;
    }
    if (acc <= last) {
      holes.add(acc, last);
    }
    return holes;
  }
  optimize() {
    this.needOptimize = false;
    let changed = false;
    const newRanges: Range[] = [];
    this.ranges.sort((a, b) => a.first - b.first);
    outer: for (const range of this.ranges) {
      for (const newRange of newRanges) {
        // Range extends the end of newRange or is contained
        if (newRange.last + 1 >= range.first && newRange.first <= range.first) {
          newRange.last = Math.max(newRange.last, range.last);
          changed = true;
          continue outer;
        }
        // Range extends the start of newRange or is contained
        if (newRange.first >= range.first && newRange.first - 1 <= range.last) {
          newRange.first = Math.min(newRange.first, range.first);
          changed = true;
          continue outer;
        }
        // Range covers newRange
        if (newRange.first >= range.first && newRange.last <= range.last) {
          newRange.first = range.first;
          newRange.last = range.last;
          changed = true;
          continue outer;
        }
      }
      // Ranges are separate
      newRanges.push(range);
    }
    newRanges.sort((a, b) => a.first - b.first);
    this.ranges = newRanges;
    if (changed) {
      this.optimize();
    }
  }
  any() {
    return this.ranges.length > 0;
  }
  toArray() {
    if (this.needOptimize) {
      this.optimize();
    }
    const items = [];
    for (const range of this.ranges) {
      for (let i = range.first; i <= range.last; i++) {
        items.push(i);
      }
    }
    return items;
  }
}
