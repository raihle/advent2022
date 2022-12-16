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
  console.log("A: ", pressureReleasePlan(network, 30));
}

function parseValve(line: string): Valve {
  const [, name, flow, tunnels] = VALVE_REGEX.exec(line);
  return {
    name,
    flowRate: Number(flow),
    tunnels: tunnels.split(", "),
  };
}

function pressureReleasePlan(
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
  return pressureReleaseHelper(network, active, "AA", minutes, 0, knownStates);
}

function pressureReleaseHelper(
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
  if (allEqual(true, active.values())) {
    return 0;
  }
  const currentState = serializeState(active, at, minutes, released);
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
        pressureReleaseHelper(
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
            pressureReleaseHelper(
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
  released: number
) {
  const state = [];
  active.forEach((value: boolean, name: string) => state.push(value ? 1 : 0));
  return (
    at +
    String(minute).padStart(2, "0") +
    String(released).padStart(16, "0") +
    state.join("")
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
  const atA = a.substring(0, 2);
  const atB = b.substring(0, 2);
  if (atA != atB) {
    return false;
  }
  const minutesA = Number(a.substring(2, 4));
  const minutesB = Number(b.substring(2, 4));
  if (minutesA > minutesB) {
    return false;
  }
  const releasedA = Number(a.substring(4, 20));
  const releasedB = Number(b.substring(4, 20));
  if (releasedA > releasedB) {
    return false;
  }
  for (let i = 4; i < a.length; i++) {
    if (a.charAt(i) == "1" && b.charAt(i) == "0") {
      return false;
    }
  }
  return true;
}
