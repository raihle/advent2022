import { Position } from "../day-12/types";
import { Range, Ranges } from "../utils/range";

type Sensor = {
  sensorPosition: Position;
  beaconPosition: Position;
  distanceToBeacon: number;
};

export async function test() {
  run(
    [
      "Sensor at x=2, y=18: closest beacon is at x=-2, y=15",
      "Sensor at x=9, y=16: closest beacon is at x=10, y=16",
      "Sensor at x=13, y=2: closest beacon is at x=15, y=3",
      "Sensor at x=12, y=14: closest beacon is at x=10, y=16",
      "Sensor at x=10, y=20: closest beacon is at x=10, y=16",
      "Sensor at x=14, y=17: closest beacon is at x=10, y=16",
      "Sensor at x=8, y=7: closest beacon is at x=2, y=10",
      "Sensor at x=2, y=0: closest beacon is at x=2, y=10",
      "Sensor at x=0, y=11: closest beacon is at x=2, y=10",
      "Sensor at x=20, y=14: closest beacon is at x=25, y=17",
      "Sensor at x=17, y=20: closest beacon is at x=21, y=22",
      "Sensor at x=16, y=7: closest beacon is at x=15, y=3",
      "Sensor at x=14, y=3: closest beacon is at x=15, y=3",
      "Sensor at x=20, y=1: closest beacon is at x=15, y=3",
    ],
    10,
    0,
    20
  );
}

export async function main(input: string[]) {
  run(input, 2000000, 0, 4000000);
}

function run(
  input: string[],
  rowToScan: number,
  minPosition: number,
  maxPosition: number
) {
  const sensors = input.map(parseSensor);
  console.log("A: ", coveredSpots(sensors, rowToScan).size);

  const distressLocation = distressBeaconLocation(
    sensors,
    minPosition,
    maxPosition
  );
  console.log("B: ", distressLocation.x * 4000000 + distressLocation.y);
}

function parseSensor(line: string): Sensor {
  const [sensorSpec, beaconSpec] = line.split(":");
  const sensorPosition = parseCoordinates(sensorSpec);
  const beaconPosition = parseCoordinates(beaconSpec);
  const distanceToBeacon =
    Math.abs(sensorPosition.x - beaconPosition.x) +
    Math.abs(sensorPosition.y - beaconPosition.y);
  return {
    sensorPosition,
    beaconPosition,
    distanceToBeacon,
  };
}

function parseCoordinates(spec: string): Position {
  const [xPart, yPart] = spec.split(",");
  const x = Number(xPart.split("=")[1]);
  const y = Number(yPart.split("=")[1]);
  return { x, y };
}

function coveredSpots(sensors: Sensor[], line: number) {
  const covered = new Set<number>();
  sensors
    .flatMap((sensor) => coveredBySensor(sensor, line))
    .forEach((x) => covered.add(x));

  sensors.forEach((sensor) => {
    if (sensor.beaconPosition.y == line) {
      covered.delete(sensor.beaconPosition.x);
    }
  });
  return covered;
}

function coveredRanges(sensors: Sensor[], line: number) {
  const covered = new Ranges();
  sensors
    .map((sensor) => sensorRange(sensor, line))
    .forEach((range) => {
      if (range != undefined) {
        covered.add(range.first, range.last);
      }
    });

  return covered;
}

/** Returns the x positions covered by a sensor on a given y position (line) */
function coveredBySensor(sensor: Sensor, line: number): number[] {
  const distanceToLine = Math.abs(sensor.sensorPosition.y - line);
  const reachOnLine = sensor.distanceToBeacon - distanceToLine;
  if (reachOnLine >= 0) {
    const startX = sensor.sensorPosition.x - reachOnLine;
    const endX = sensor.sensorPosition.x + reachOnLine;
    return range(startX, endX);
  }
  return [];
}

function sensorRange(sensor: Sensor, line: number): Range {
  const distanceToLine = Math.abs(sensor.sensorPosition.y - line);
  const reachOnLine = sensor.distanceToBeacon - distanceToLine;
  if (reachOnLine >= 0) {
    const first = sensor.sensorPosition.x - reachOnLine;
    const last = sensor.sensorPosition.x + reachOnLine;
    return { first, last };
  }
  return undefined;
}

function range(first: number, last: number): number[] {
  const numbers = [];
  for (let i = first; i <= last; i++) {
    numbers.push(i);
  }
  return numbers;
}

function distressBeaconLocation(
  sensors: Sensor[],
  minPosition: number,
  maxPosition: number
): Position {
  for (let y = minPosition; y <= maxPosition; y++) {
    const covered = coveredRanges(sensors, y);
    const holes = covered.holes(minPosition, maxPosition);
    if (holes.any()) {
      const arr = holes.toArray();
      if (arr.length == 1) {
        return { x: arr[0], y };
      } else {
        throw new Error("Too many holes");
      }
    }
  }
  throw new Error("No holes");
}
