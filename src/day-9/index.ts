import { repeat } from "../utils/repeat";

export async function test() {
  main(["R 4", "U 4", "L 3", "D 1", "R 4", "D 1", "L 5", "R 2"]);
}

export async function main(input: string[]) {
  const visitedA = simulateChain(2, input);
  const visitedB = simulateChain(10, input);
  console.log("A: ", visitedA.size);
  console.log("B: ", visitedB.size);
}

function simulateChain(length: number, instructions: string[]) {
  const tail = new Knot();
  let t = tail;
  let h = tail;
  for (let i = 1; i < length; i++) {
    h = new Knot(t);
    t = h;
  }
  const head = h;

  const visitedPositions = new Set<string>();
  instructions.forEach((instruction) => {
    const [direction, count] = instruction.split(" ");
    repeat(Number(count), () => {
      switch (direction) {
        case "U":
          head.move(0, -1);
          break;
        case "D":
          head.move(0, 1);
          break;
        case "L":
          head.move(-1, 0);
          break;
        case "R":
          head.move(1, 0);
          break;
        default:
          throw new Error(`Unknown direction ${direction}`);
      }
      visitedPositions.add(JSON.stringify(tail.position()));
    });
  });
  return visitedPositions;
}

type Position = { x: number; y: number };
class Knot {
  private x: number;
  private y: number;
  private follower: Knot;

  constructor(follower?: Knot) {
    this.x = 0;
    this.y = 0;
    this.follower = follower;
  }

  move(x: number, y: number) {
    this.x += x;
    this.y += y;
    if (this.follower) {
      const xDelta = this.x - this.follower.x;
      const yDelta = this.y - this.follower.y;
      if (Math.abs(xDelta) >= 2 || Math.abs(yDelta) >= 2) {
        this.follower.move(Math.sign(xDelta), Math.sign(yDelta));
      }
    }
  }

  position(): Position {
    return { x: this.x, y: this.y };
  }
}
