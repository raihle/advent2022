import { chunkList } from "../utils/chunk-list";
import { product } from "../utils/product";
import { repeat } from "../utils/repeat";
import { Pathfinder } from "./pathfinder";
import { Position, Route } from "./types";

export async function test() {
  main(["Sabqponm", "abcryxxl", "accszExk", "acctuvwj", "abdefghi"]);
}

export async function main(input: string[]) {
  const map = parseHeights(input);
  const end = find("E", input);
  const route = findPath(map, find("S", input), end);
  console.log("A: ", route.length - 1);

  const hikingRoutes = findAll("a", input).map((hikingStart) =>
    findPath(map, hikingStart, end)
  );
  console.log(
    "B: ",
    hikingRoutes
      .filter((r) => r != undefined)
      .map((r) => r.length)
      .sort((a, b) => a - b)[0] - 1
  );
}

function parseHeights(lines: string[]) {
  return lines.map((line) => line.split("").map(parseHeight));
}

function parseHeight(char: string) {
  if (char == "S") {
    return parseHeight("a");
  }
  if (char == "E") {
    return parseHeight("z");
  }
  return char.charCodeAt(0) - 96;
}

function find(char: string, input: string[]): Position {
  let y = 0;
  for (const line of input) {
    const x = line.indexOf(char);
    if (x >= 0) return { x, y };
    y++;
  }
  throw new Error(`${char} was never found`);
}

function findAll(char: string, input: string[]): Position[] {
  const positions = [];
  let y = 0;
  for (const line of input) {
    const x = line.indexOf(char);
    if (x >= 0) positions.push({ x, y });
    y++;
  }
  return positions;
}

function findPath(map: number[][], start: Position, end: Position): Route {
  const canWalkFn = (from: Position, to: Position) => {
    return map[from.y][from.x] >= map[to.y][to.x] - 1;
  };
  const pathfinder = new Pathfinder(map[0].length, map.length, canWalkFn);
  return pathfinder.findPath(start, end);
}
