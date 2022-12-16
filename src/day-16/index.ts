import { Position } from "../day-12/types";
import { mapBy } from "../utils/mapBy";
import { max } from "../utils/max";
import { Range, Ranges } from "../utils/range";

type Valve = {
  name: string;
  flowRate: number;
  tunnels: string[];
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
  const network = mapBy("name", input.map(parseValve));
  console.log(network);
  console.log("A: ", pressureReleasePlanA(network, 30));
}

function parseValve(line: string): Valve {
  const [, name, flow, tunnels] = VALVE_REGEX.exec(line);
  return {
    name,
    flowRate: Number(flow),
    tunnels: tunnels.split(", "),
  };
}

type Benchmark = { released: number; remaining: number };
function pressureReleasePlanA(
  network: Map<string, Valve>,
  minutes: number
): number {
  const start = network.get("AA");
  const active = new Map<string, boolean>();
  // "Cheat" by pretending that 0-flowrate valves are already on to reduce options
  network.forEach((_, name: string) =>
    active.set(name, network.get(name).flowRate == 0)
  );
  const knownStates = [];
  const benchmarks = new Map<number, Benchmark>();
  return pressureReleaseHelperA(network, active, "AA", minutes, 0, knownStates);
}

function pressureReleaseHelperA(
  network: Map<string, Valve>,
  active: Map<string, boolean>,
  at: string,
  minutes: number,
  released: number,
  knownStates: string[]
): number {
  if (minutes <= 1) {
    return 0;
  }
  if (minutes >= 28) {
    console.log(at, minutes);
  }
  if (allEqual(true, active.values())) {
    return 0;
  }
  const currentState = serializeState(
    active,
    at,
    minutes,
    released,
    maxReleasablePressure(network, active, minutes)
  );
  const betterState = knownStates.find((ks) =>
    isEqualOrWorse(currentState, ks)
  );
  if (betterState) {
    return 0;
  }
  knownStates.push(currentState);

  const bestNoTurnMove = max(
    network
      .get(at)
      .tunnels.map((name) =>
        pressureReleaseHelperA(
          network,
          active,
          name,
          minutes - 1,
          released,
          knownStates
        )
      )
  );
  if (active.get(at) || minutes == 1 || network.get(at).flowRate <= 0) {
    // Current valve is already on, or no time to turn it
    return bestNoTurnMove;
  } else {
    const flowGain = network.get(at).flowRate * (minutes - 1);
    const newActive = new Map<string, boolean>(active);
    newActive.set(at, true);
    const bestPostTurnMove =
      flowGain +
      max(
        network
          .get(at)
          .tunnels.map((name) =>
            pressureReleaseHelperA(
              network,
              newActive,
              name,
              minutes - 2,
              released + flowGain,
              knownStates
            )
          )
      );
    return Math.max(bestNoTurnMove, bestPostTurnMove);
  }
}

function pressureReleaseHelperB(
  network: Map<string, Valve>,
  active: Map<string, boolean>,
  at1: string,
  at2: string,
  minutes: number,
  released: number,
  knownStates: string[]
): number {
  if (minutes <= 1) {
    return 0;
  }
  if (minutes >= 28) {
    console.log(at1, at2, minutes);
  }
  if (allEqual(true, active.values())) {
    return 0;
  }
  const currentState = serializeState(
    active,
    at1,
    at2,
    minutes,
    released,
    maxReleasablePressure(network, active, minutes)
  );
  // const currentState = serializeStateB(
  //   released,
  //   maxReleasablePressure(network, active, minutes)
  // );
  const betterState = knownStates.find((ks) =>
    isEqualOrWorse(currentState, ks)
  );
  if (betterState) {
    return 0;
  }
  knownStates.push(currentState);

  const bestNoTurnMove = max(
    network
      .get(at)
      .tunnels.map((name) =>
        pressureReleaseHelperA(
          network,
          active,
          name,
          minutes - 1,
          released,
          knownStates
        )
      )
  );
  if (active.get(at) || minutes == 1 || network.get(at).flowRate <= 0) {
    // Current valve is already on, or no time to turn it
    return bestNoTurnMove;
  } else {
    const flowGain = network.get(at).flowRate * (minutes - 1);
    const newActive = new Map<string, boolean>(active);
    newActive.set(at, true);
    const bestPostTurnMove =
      flowGain +
      max(
        network
          .get(at)
          .tunnels.map((name) =>
            pressureReleaseHelperA(
              network,
              newActive,
              name,
              minutes - 2,
              released + flowGain,
              knownStates
            )
          )
      );
    return Math.max(bestNoTurnMove, bestPostTurnMove);
  }
}

function allEqual<T>(target: T, list: IterableIterator<T>) {
  for (const val of list) {
    if (list != target) {
      return false;
    }
  }
  return true;
}

function serializeState(
  active: Map<string, boolean>,
  at: string,
  minute: number,
  released: number,
  maxRemainingFlowRate: number
) {
  const state = [];
  active.forEach((value: boolean, name: string) => state.push(value ? 1 : 0));
  return (
    at +
    String(minute).padStart(2, "0") +
    String(released).padStart(16, "0") +
    String(maxRemainingFlowRate).padStart(16, "0") +
    state.join("")
  );
}
function serializeState2(
  active: Map<string, boolean>,
  at1: string,
  at2: string,
  minute: number,
  released: number,
  maxRemainingFlowRate: number
) {
  const state = [];
  active.forEach((value: boolean, name: string) => state.push(value ? 1 : 0));
  return (
    at1 +
    at2 +
    String(minute).padStart(2, "0") +
    String(released).padStart(16, "0") +
    String(maxRemainingFlowRate).padStart(16, "0") +
    state.join("")
  );
}

function serializeStateB(released: number, maxReleasable: number) {
  return (
    String(released).padStart(16, "0") + String(maxReleasable).padStart(16, "0")
  );
}

/**
 * Returns true if A is worse (or equal) than B is every way
 * - Same position
 * - Less time
 * - Fewer valves turned
 * @param a
 * @param b
 * @returns
 */
function isEqualOrWorse(a: string, b: string) {
  const minutesA = Number(a.substring(2, 4));
  const minutesB = Number(b.substring(2, 4));
  const releasedA = Number(a.substring(4, 20));
  const releasedB = Number(b.substring(4, 20));
  const remainingA = Number(a.substring(20, 36));
  const remainingB = Number(b.substring(20, 36));
  // 4 is an estimated discount rate. Higher number for more accurate but slower solution.
  if (remainingA + releasedA < releasedB) {
    // There's no way A can catch up
    return true;
  }
  const atA = a.substring(0, 2);
  const atB = b.substring(0, 2);
  if (atA != atB) {
    return false;
  }
  if (minutesA > minutesB) {
    return false;
  }
  for (let i = 36; i < a.length; i++) {
    if (a.charAt(i) == "1" && b.charAt(i) == "0") {
      return false;
    }
  }
  return true;
}
function isEqualOrWorseB(a: string, b: string) {
  const releasedA = Number(a.substring(0, 16));
  const releasedB = Number(b.substring(0, 16));
  const remainingA = Number(a.substring(16, 32));
  const remainingB = Number(b.substring(16, 32));
  // 4 is an estimated discount rate. Higher number for more accurate but slower solution.
  return remainingA + releasedA < releasedB + remainingB / 4;
}
function isEqualOrWorse2(a: string, b: string) {
  const minutesA = Number(a.substring(4, 6));
  const minutesB = Number(b.substring(4, 6));
  const releasedA = Number(a.substring(6, 22));
  const releasedB = Number(b.substring(6, 22));
  const remainingA = Number(a.substring(22, 38));
  const remainingB = Number(b.substring(22, 38));
  // 4 is an estimated discount rate. Higher number for more accurate but slower solution.
  if (remainingA + releasedA < releasedB) {
    // There's no way A can catch up
    return true;
  }
  const atA1 = a.substring(0, 2);
  const atA2 = a.substring(2, 4);
  const atB1 = b.substring(0, 2);
  const atB2 = b.substring(2, 4);
  if (!((atA1 == atB1 && atA2 == atB2) || (atA1 == atB2 && atA2 == atB1))) {
    return false;
  }
  if (minutesA > minutesB) {
    return false;
  }
  for (let i = 36; i < a.length; i++) {
    if (a.charAt(i) == "1" && b.charAt(i) == "0") {
      return false;
    }
  }
  return true;
}

/**
 * The highest pressure that can theoretically be released from a point in time
 */
function maxReleasablePressure(
  network: Map<string, Valve>,
  active: Map<string, boolean>,
  minutes: number
) {
  let availableFlow = [];
  network.forEach((valve, name) => {
    if (!active.get(name)) {
      availableFlow.push(valve.flowRate);
    }
  });
  availableFlow.sort((a, b) => b - a);
  let gained = 0;
  for (let i = minutes - 1; i > 0 && availableFlow.length > 0; i -= 2) {
    gained += i * availableFlow.shift();
  }
  return gained;
}
