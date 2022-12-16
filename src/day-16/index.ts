import { combinations } from "../utils/combinations";
import { mapBy } from "../utils/mapBy";
import { max } from "../utils/max";

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
  opened: OpenValves;
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

  const startA: GameState = {
    actors: [{ to: "AA", turnsLeft: 0 }],
    opened: new Set(),
    released: 0,
    turnsRemaining: 30,
  };
  const startB: GameState = {
    actors: [
      { to: "AA", turnsLeft: 0 },
      { to: "AA", turnsLeft: 0 },
    ],
    opened: new Set(),
    released: 0,
    turnsRemaining: 26,
  };
  network.forEach((valve, name) => {
    // "Cheat" by deleting useless valves - we navigate using the distance map anyways
    if (valve.flowRate == 0) {
      network.delete(name);
    }
  });
  console.log("A: ", simulateGame(network, shortestDistances, startA, []));
  console.log("B: ", simulateGame(network, shortestDistances, startB, []));
}

function simulateGame(
  network: Network,
  distances: DistanceMap,
  state: GameState,
  knownStates: GameState[]
) {
  if (state.turnsRemaining == 0) {
    return state.released;
  }
  if (state.turnsRemaining == 25) {
    // Print a status update when we start a new "big" branch
    // The update is mainly useful at initialTurns - 1,
    // so set it to 29 for A and 25 for B.
    console.log(
      "%s | Target: %s | States: %d",
      new Date(),
      state.actors.map(({ to }) => to).join("/"),
      knownStates.length
    );
  }
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
        for (let i = 0; i < knownStates.length; i++) {
          const oldState = knownStates[i];
          if (compareStates(network, oldState, tentativeState)) {
            // No point in continuing this branch, there's a better one
            return 0;
          }
        }
        const toPrune = [];
        for (let i = 0; i < knownStates.length; i++) {
          const oldState = knownStates[i];
          if (compareStates(network, tentativeState, oldState)) {
            // Number of states can exceed the max array size if we don't prune them
            toPrune.push(i - toPrune.length);
          }
        }
        toPrune.forEach((p) => knownStates.splice(p, 1));
        knownStates.push(tentativeState);
        return simulateGame(network, distances, tentativeState, knownStates);
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
    // Keep moving to current target
    return [{ to: actor.to, turnsLeft: actor.turnsLeft - 1 }];
  } else {
    // Find a new target (or open the last target)
    const moves = subtract(network.keys(), state.opened).map((target) => ({
      to: target,
      turnsLeft: distances.get(actor.to).get(target),
    }));
    if (moves.length == 0) {
      // If there's nothing to open, wait for the rest of the game
      return [
        {
          to: actor.to,
          turnsLeft: Infinity,
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

/**
 * Return true if a is definitely better or equal to b
 * False negatives make the simulation run slower but will still yield correct results
 */
function compareStates(network: Network, a: GameState, b: GameState) {
  if (a.turnsRemaining < b.turnsRemaining) {
    return false;
  }
  if (a.released < b.released) {
    return false;
  }
  if (!equivalentOrBetterActors(a, b)) {
    return false;
  }
  if (currentFlowRate(network, a) < currentFlowRate(network, b)) {
    return false;
  }
  return true;
}

function equivalentOrBetterActors(a: GameState, b: GameState) {
  for (const ba of b.actors) {
    const equivalentOrBetter = a.actors.find(
      (aa) => aa.to == ba.to && aa.turnsLeft <= ba.turnsLeft
    );
    if (equivalentOrBetter == undefined) {
      return false;
    }
  }
  return true;
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
