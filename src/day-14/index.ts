import { Position } from "../day-12/types";
import { pairs } from "../utils/pairs";

export async function test() {
  main(["498,4 -> 498,6 -> 496,6", "503,4 -> 502,4 -> 502,9 -> 494,9"]);
}

export async function main(input: string[]) {
  const { rocks, lowestRockY } = parsePaths(input);
  const sandAtRestA = simulateSand(
    rocks,
    { x: 500, y: 0 },
    undefined,
    ({ x, y }) => y > lowestRockY
  );
  console.log("A: ", sandAtRestA.size);
  const sandAtRestB = simulateSand(
    rocks,
    { x: 500, y: 0 },
    lowestRockY + 2,
    ({ x, y }) => x == 500 && y == 0
  );
  console.log("B: ", sandAtRestB.size);
}

function simulateSand(
  rocks: Set<string>,
  sandFrom: Position,
  floorY: number | undefined,
  stopCondition: (pos: Position) => boolean
) {
  const sandAtRest = new Set<string>();
  const movingSand = { ...sandFrom };
  while (true) {
    const down = { x: movingSand.x, y: movingSand.y + 1 };
    const left = { x: movingSand.x - 1, y: movingSand.y + 1 };
    const right = { x: movingSand.x + 1, y: movingSand.y + 1 };
    if (!isBlocked(down)) {
      movingSand.y++;
    } else if (!isBlocked(left)) {
      movingSand.y++;
      movingSand.x--;
    } else if (!isBlocked(right)) {
      movingSand.y++;
      movingSand.x++;
    } else {
      sandAtRest.add(JSON.stringify(movingSand));
      if (stopCondition(movingSand)) {
        break;
      }
      movingSand.x = sandFrom.x;
      movingSand.y = sandFrom.y;
      continue;
    }
    if (stopCondition(movingSand)) {
      break;
    }
  }

  return sandAtRest;

  function isBlocked(position: Position): boolean {
    const s = JSON.stringify(position);
    return (
      (floorY ? position.y >= floorY : false) ||
      rocks.has(s) ||
      sandAtRest.has(s)
    );
  }
}

function parsePaths(input: string[]): {
  rocks: Set<string>;
  lowestRockY: number;
} {
  let lowestRockY = 0;
  const rocks = new Set<string>();
  input.forEach((line) => {
    const rocksInPath = parsePath(line);
    rocksInPath.forEach((rock) => {
      rocks.add(JSON.stringify(rock));
      lowestRockY = Math.max(lowestRockY, rock.y);
    });
  });
  return { rocks, lowestRockY };
}

function parsePath(line: string): Position[] {
  // Some corners are duplicated but it's ok since parsePaths deduplicates
  const rocks = [];
  const corners = line.split(" -> ");
  const straights = pairs(corners);
  straights.forEach(([a, b]) => {
    const [ax, ay] = a.split(",").map(Number);
    const [bx, by] = b.split(",").map(Number);
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        rocks.push({ x, y });
      }
    }
  });
  return rocks;
}
