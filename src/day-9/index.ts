import { last } from "../utils/last";
import { repeat } from "../utils/repeat";

export async function test() {
  main(["R 4", "U 4", "L 3", "D 1", "R 4", "D 1", "L 5", "R 2"]);
}

export async function main(input: string[]) {
  const rope = new Rope();
  const visited = moveRope(rope, input);
  console.log("A: ", visited.size);
}

function moveRope(rope: Rope, instructions: string[]) {
  const visitedPositions = new Set<string>();
  instructions.forEach((instruction) => {
    const [direction, count] = instruction.split(" ");
    repeat(Number(count), () => {
      rope.moveHead(direction as Direction);
      visitedPositions.add(JSON.stringify(rope.tailPosition()));
    });
  });
  return visitedPositions;
}

type Direction = "R" | "U" | "L" | "D";
type Position = { x: number; y: number };
class Rope {
  private head: Position;
  private tail: Position;

  constructor() {
    this.head = { x: 0, y: 0 };
    this.tail = { x: 0, y: 0 };
  }

  moveHead(direction: Direction) {
    switch (direction) {
      case "U":
        this.head.y--;
        break;
      case "D":
        this.head.y++;
        break;
      case "L":
        this.head.x--;
        break;
      case "R":
        this.head.x++;
        break;
    }
    const xDelta = this.head.x - this.tail.x;
    const yDelta = this.head.y - this.tail.y;
    if (Math.abs(xDelta) >= 2 || Math.abs(yDelta) >= 2) {
      this.tail.x += Math.sign(xDelta);
      this.tail.y += Math.sign(yDelta);
    }
  }

  tailPosition(): Position {
    return this.tail;
  }
}
