import { isConstructSignatureDeclaration } from "../../node_modules/typescript/lib/typescript";
import { repeat } from "../utils/repeat";
import { Position, Route } from "./types";

type CanWalkFn = (from: Position, to: Position) => boolean;

export class Pathfinder {
  private width: number;
  private height: number;
  private canWalk: CanWalkFn;

  constructor(width: number, height: number, canWalk: CanWalkFn) {
    this.width = width;
    this.height = height;
    this.canWalk = canWalk;
  }

  findPath(from: Position, to: Position): Route {
    const visited = new Map();
    const queue: Route[] = [];

    this.visit([from], visited, queue);
    while (queue.length > 0) {
      let nextRoute = queue.shift();
      let nextPosition = nextRoute[nextRoute.length - 1];
      if (nextPosition.x == to.x && nextPosition.y == to.y) {
        return nextRoute;
      }
      this.visit(nextRoute, visited, queue);
    }
    console.warn(
      `Failed to find a route from ${JSON.stringify(from)} to ${JSON.stringify(
        to
      )}`
    );
  }

  private visit(route: Route, visited: Map<number, Route>, queue: Route[]) {
    const position = route[route.length - 1];
    const positionId = position.y * this.width + position.x;
    if (visited.has(positionId)) return;
    visited.set(positionId, route);
    this.consider(route, { x: position.x, y: position.y + 1 }, queue);
    this.consider(route, { x: position.x, y: position.y - 1 }, queue);
    this.consider(route, { x: position.x + 1, y: position.y }, queue);
    this.consider(route, { x: position.x - 1, y: position.y }, queue);
  }

  private consider(route: Route, next: Position, queue: Route[]) {
    if (next.x >= this.width || next.y >= this.height) return;
    if (next.x < 0 || next.y < 0) return;
    if (this.canWalk(route[route.length - 1], next)) {
      queue.push([...route, next]);
    }
  }
}
