import { last } from "../utils/last";
import { repeat } from "../utils/repeat";

export async function test() {
  main(["30373", "25512", "65332", "33549", "35390"]);
}

export async function main(input: string[]) {
  const trees = input.map((line) => line.split("").map(Number));

  console.log("A: ", treesSeenFromEdges(trees));
  console.log("B: ", scoreTrees(trees).sort((a, b) => b - a)[0]);
}

function sightLinesFromLeft(trees: number[][]): number[][] {
  const sightLines = [];
  for (let y = 0; y < trees.length; y++) {
    let highest = -1;
    sightLines.push([]);
    for (let x = 0; x < trees[0].length; x++) {
      sightLines[y].push(highest);
      highest = Math.max(highest, trees[y][x]);
    }
  }
  return sightLines;
}

function sightLinesFromRight(trees: number[][]): number[][] {
  const sightLines = [];
  for (let y = 0; y < trees.length; y++) {
    let highest = -1;
    sightLines.push([]);
    for (let x = trees[0].length - 1; x >= 0; x--) {
      sightLines[y].unshift(highest);
      highest = Math.max(highest, trees[y][x]);
    }
  }
  return sightLines;
}

function sightLinesFromTop(trees: number[][]): number[][] {
  const sightLines = [];
  repeat(trees.length, () => sightLines.push([]));
  for (let x = 0; x < trees[0].length; x++) {
    let highest = -1;
    for (let y = 0; y < trees.length; y++) {
      sightLines[y].push(highest);
      highest = Math.max(highest, trees[y][x]);
    }
  }
  return sightLines;
}

function sightLinesFromBottom(trees: number[][]): number[][] {
  const sightLines: number[][] = [];
  repeat(trees.length, () => sightLines.push([]));
  for (let x = 0; x < trees[0].length; x++) {
    let highest = -1;
    for (let y = trees.length - 1; y >= 0; y--) {
      sightLines[y].push(highest);
      highest = Math.max(highest, trees[y][x]);
    }
  }
  return sightLines;
}

function treesSeenFromEdges(trees: number[][]) {
  const highestTrees = {
    left: sightLinesFromLeft(trees),
    right: sightLinesFromRight(trees),
    top: sightLinesFromTop(trees),
    bottom: sightLinesFromBottom(trees),
  };
  console.log(highestTrees.bottom.map(last));
  let treesSeen = 0;
  for (let y = 0; y < trees.length; y++) {
    for (let x = 0; x < trees[0].length; x++) {
      if (treeIsVisibleFromEdge(trees, highestTrees, x, y)) {
        treesSeen++;
      }
    }
  }
  return treesSeen;
}

type Direction = "left" | "right" | "top" | "bottom";
function treeIsVisibleFromEdge(
  trees: number[][],
  highestTrees: Record<Direction, number[][]>,
  x: number,
  y: number
): boolean {
  const treeHeight = trees[y][x];
  if (treeHeight > highestTrees.left[y][x]) return true;
  if (treeHeight > highestTrees.right[y][x]) return true;
  if (treeHeight > highestTrees.top[y][x]) return true;
  if (treeHeight > highestTrees.bottom[y][x]) return true;
  return false;
}

function scoreTrees(trees: number[][]): number[] {
  const scores = [];
  for (let y = 0; y < trees.length; y++) {
    for (let x = 0; x < trees[0].length; x++) {
      scores.push(scoreTree(trees, x, y));
    }
  }
  return scores;
}

function scoreTree(trees: number[][], treeX: number, treeY: number): number {
  const seen = {
    left: visibleLeft(trees, treeX, treeY),
    right: visibleRight(trees, treeX, treeY),
    up: visibleUp(trees, treeX, treeY),
    down: visibleDown(trees, treeX, treeY),
  };
  return seen.left * seen.right * seen.up * seen.down;
}

function visibleLeft(trees: number[][], treeX: number, treeY: number): number {
  const treeHeight = trees[treeY][treeX];
  let visible = 0;
  for (let x = treeX - 1; x >= 0; x--) {
    visible++;
    if (trees[treeY][x] >= treeHeight) {
      break;
    }
  }
  return visible;
}

function visibleRight(trees: number[][], treeX: number, treeY: number): number {
  const treeHeight = trees[treeY][treeX];
  let visible = 0;
  for (let x = treeX + 1; x < trees[0].length; x++) {
    visible++;
    if (trees[treeY][x] >= treeHeight) {
      break;
    }
  }
  return visible;
}

function visibleUp(trees: number[][], treeX: number, treeY: number): number {
  const treeHeight = trees[treeY][treeX];
  let visible = 0;
  for (let y = treeY - 1; y >= 0; y--) {
    visible++;
    if (trees[y][treeX] >= treeHeight) {
      break;
    }
  }
  return visible;
}

function visibleDown(trees: number[][], treeX: number, treeY: number): number {
  const treeHeight = trees[treeY][treeX];
  let visible = 0;
  for (let y = treeY + 1; y < trees.length; y++) {
    visible++;
    if (trees[y][treeX] >= treeHeight) {
      break;
    }
  }
  return visible;
}
