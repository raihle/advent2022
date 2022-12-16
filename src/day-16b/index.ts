import { OperationCanceledException } from "../../node_modules/typescript/lib/typescript";
import { combinations } from "../utils/combinations";
import { mapBy } from "../utils/mapBy";
import { max } from "../utils/max";
import { min } from "../utils/min";
import { sum } from "../utils/sum";

type Valve = {
  name: string;
  flowRate: number;
  tunnels: string[];
};

type OpenValves = Set<string>;

type Network = Map<string, Valve>;

type DistanceMap = Map<string, Map<string, number>>;

type ActorPosition = {
  to: string;
  turnsLeft: number;
};

type GameState = {
  actors: ActorPosition[];
  opened: Set<string>;
  released: number;
  turnsRemaining: number;
};

const VALVE_REGEX =
  /Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)/;

export async function test() {
  main([
    "Valve AA has flow rate=0; tunnels lead to valves DD, II, BB",
    "Valve BB has flow rate=13; tunnels lead to valves CC, AA",
    "Valve CC has flow rate=2; tunnels lead to valves DD, BB",
    "Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE",
    "Valve EE has flow rate=3; tunnels lead to valves FF, DD",
    "Valve FF has flow rate=0; tunnels lead to valves EE, GG",
    "Valve GG has flow rate=0; tunnels lead to valves FF, HH",
    "Valve HH has flow rate=22; tunnel leads to valve GG",
    "Valve II has flow rate=0; tunnels lead to valves AA, JJ",
    "Valve JJ has flow rate=21; tunnel leads to valve II",
  ]);
}

export async function main(input: string[]) {
  const network: Network = mapBy("name", input.map(parseValve));
  const shortestDistances = mapShortestDistances(network);

  const startingState: GameState = {
    actors: [
      { to: "AA", turnsLeft: 0 },
      { to: "AA", turnsLeft: 0 },
    ],
    opened: new Set(),
    released: 0,
    turnsRemaining: 26,
  };
  network.forEach((valve, name) => {
    if (valve.flowRate == 0) {
      startingState.opened.add(name);
    }
  });
  console.log("A: ", simulateGame(network, shortestDistances, startingState));
}

function simulateGame(
  network: Network,
  distances: DistanceMap,
  state: GameState
) {
  if (state.turnsRemaining == 0) {
    return state.released;
  }
  if (state.turnsRemaining >= 25)
    console.log(state.actors, state.turnsRemaining);
  const actorMoves = state.actors.map((a) =>
    movesForActor(network, state, distances, a)
  );
  return max(
    combinations(actorMoves)
      .filter((moves, _, allMoves) => {
        // Don't make identical moves unless there are no other options
        const uniqueTargets = new Set(moves.map(({ to }) => to));
        return uniqueTargets.size == moves.length || allMoves.length == 1;
      })
      .map((moves) => {
        let nextOpened = state.opened;
        const valvesToOpen = moves
          .filter(({ turnsLeft }) => turnsLeft == 0)
          .map(({ to }) => to);
        if (valvesToOpen.length > 0) {
          nextOpened = new Set([...state.opened, ...valvesToOpen]);
        }
        const tentativeState: GameState = {
          turnsRemaining: state.turnsRemaining - 1,
          released: state.released + currentFlowRate(network, state),
          opened: nextOpened,
          actors: moves,
        };
        return simulateGame(network, distances, tentativeState);
      })
  );
}

function currentFlowRate(network: Network, state: GameState) {
  let flowRate = 0;
  for (const openValve of state.opened) {
    flowRate += network.get(openValve).flowRate;
  }
  return flowRate;
}

function movesForActor(
  network: Network,
  state: GameState,
  distances: DistanceMap,
  actor: ActorPosition
): ActorPosition[] {
  if (actor.turnsLeft > 0) {
    return [{ to: actor.to, turnsLeft: actor.turnsLeft - 1 }];
  } else {
    const moves = subtract(network.keys(), state.opened).map((target) => ({
      to: target,
      turnsLeft: distances.get(actor.to).get(target),
    }));
    if (moves.length == 0) {
      return [
        {
          to: actor.to,
          turnsLeft: -1,
        },
      ];
    }
    return moves;
  }
}

function subtract<T>(from: IterableIterator<T>, subtractor: Set<T>): T[] {
  const result = [];
  for (const t of from) {
    if (!subtractor.has(t)) {
      result.push(t);
    }
  }
  return result;
}

/** Return true if a is better or equal to b */
//function compareStates(a: GameState, b: GameState) {
//  if (a)
//}

function serializeState(state: GameState) {
  const locations = state.actors
    .map(({ to, turnsLeft }) => `${to}${turnsLeft}`)
    .sort()
    .join(",");
  const opened = Array.from(state.opened).sort().join("");
  return (
    locations + "|" + state.turnsRemaining + "|" + state.released + "|" + opened
  );
}

function deserializeState(serialized: string): GameState {
  const [locations, turns, released, opened] = serialized.split("|");
  return {
    actors: locations.split(",").map((location) => ({
      to: location.substring(0, 2),
      turnsLeft: Number(location.substring(2)),
    })),
    turnsRemaining: Number(turns),
    released: Number(released),
    opened: new Set(splitString(2, opened)),
  };
}

function splitString(length, toSplit: string): string[] {
  const strings = [];
  for (let i = 0; i < toSplit.length; i += length) {
    strings.push(toSplit.substring(i, i + length));
  }
  return strings;
}

function rankMoves(
  network: Network,
  openValves: OpenValves,
  distances: DistanceMap,
  at: Valve,
  turnsRemaining: number
) {
  let moves: [string, number][] = [];
  network.forEach((valve) => {
    if (!openValves.has(valve.name)) {
      const value = valueOfTurningValve(valve, distances, at, turnsRemaining);
      moves.push([valve.name, value]);
    }
  });
  moves.sort(([, a], [, b]) => b - a);
  return moves;
}

/* A rough heuristic of move quality */
function valueOfTurningValve(
  toTurn: Valve,
  distances: DistanceMap,
  at: Valve,
  turnsRemaining: number
) {
  const turnsToWalk = distances.get(at.name).get(toTurn.name);
  const turnsOpen = turnsRemaining - turnsToWalk - 1;
  const pressureReleased = turnsOpen * toTurn.flowRate;
  return pressureReleased;
}

function parseValve(line: string): Valve {
  const [, name, flow, tunnels] = VALVE_REGEX.exec(line);
  return {
    name,
    flowRate: Number(flow),
    tunnels: tunnels.split(", "),
  };
}

function mapShortestDistances(network: Map<string, Valve>): DistanceMap {
  const distances = new Map<string, Map<string, number>>();
  network.forEach((_, from) =>
    distances.set(from, new Map<string, number>([[from, 0]]))
  );
  for (let i = 0; i < network.size; i++) {
    let changed = false;
    network.forEach((_, from) => {
      const valveDistances = distances.get(from);
      valveDistances.forEach((distance, intermediate) => {
        if (distance == i) {
          const intermediateValve = network.get(intermediate);
          intermediateValve.tunnels.forEach((connected) => {
            if (!valveDistances.has(connected)) {
              valveDistances.set(connected, 1 + distance);
              changed = true;
            }
          });
        }
      });
    });
    if (!changed) {
      break;
    }
  }
  return distances;
}
