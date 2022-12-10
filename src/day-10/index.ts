import { group } from "../utils/group";
import { sum } from "../utils/sum";

export async function test() {
  main([
    "addx 15",
    "addx -11",
    "addx 6",
    "addx -3",
    "addx 5",
    "addx -1",
    "addx -8",
    "addx 13",
    "addx 4",
    "noop",
    "addx -1",
    "addx 5",
    "addx -1",
    "addx 5",
    "addx -1",
    "addx 5",
    "addx -1",
    "addx 5",
    "addx -1",
    "addx -35",
    "addx 1",
    "addx 24",
    "addx -19",
    "addx 1",
    "addx 16",
    "addx -11",
    "noop",
    "noop",
    "addx 21",
    "addx -15",
    "noop",
    "noop",
    "addx -3",
    "addx 9",
    "addx 1",
    "addx -3",
    "addx 8",
    "addx 1",
    "addx 5",
    "noop",
    "noop",
    "noop",
    "noop",
    "noop",
    "addx -36",
    "noop",
    "addx 1",
    "addx 7",
    "noop",
    "noop",
    "noop",
    "addx 2",
    "addx 6",
    "noop",
    "noop",
    "noop",
    "noop",
    "noop",
    "addx 1",
    "noop",
    "noop",
    "addx 7",
    "addx 1",
    "noop",
    "addx -13",
    "addx 13",
    "addx 7",
    "noop",
    "addx 1",
    "addx -33",
    "noop",
    "noop",
    "noop",
    "addx 2",
    "noop",
    "noop",
    "noop",
    "addx 8",
    "noop",
    "addx -1",
    "addx 2",
    "addx 1",
    "noop",
    "addx 17",
    "addx -9",
    "addx 1",
    "addx 1",
    "addx -3",
    "addx 11",
    "noop",
    "noop",
    "addx 1",
    "noop",
    "addx 1",
    "noop",
    "noop",
    "addx -13",
    "addx -19",
    "addx 1",
    "addx 3",
    "addx 26",
    "addx -30",
    "addx 12",
    "addx -1",
    "addx 3",
    "addx 1",
    "noop",
    "noop",
    "noop",
    "addx -9",
    "addx 18",
    "addx 1",
    "addx 2",
    "noop",
    "noop",
    "addx 9",
    "noop",
    "noop",
    "noop",
    "addx -1",
    "addx 2",
    "addx -37",
    "addx 1",
    "addx 3",
    "noop",
    "addx 15",
    "addx -21",
    "addx 22",
    "addx -6",
    "addx 1",
    "noop",
    "addx 2",
    "addx 1",
    "noop",
    "addx -10",
    "noop",
    "noop",
    "addx 20",
    "addx 1",
    "addx 2",
    "addx 2",
    "addx -6",
    "addx -11",
    "noop",
    "noop",
    "noop",
  ]);
}

export async function main(input: string[]) {
  const xs = xValuesDuringCycles(input);
  console.log(xs.length);
  console.log(signalStrengths(xs).filter((_, i) => (i - 19) % 40 == 0));
  console.log(
    "A: ",
    sum(signalStrengths(xs).filter((_, i) => (i - 19) % 40 == 0))
  );
  console.log("B: ", drawImage(xs));
}

function xValuesDuringCycles(instructions) {
  return instructions.reduce(
    (xValues, instruction) => {
      const [name, argument] = instruction.split(" ");
      switch (name) {
        case "noop":
          xValues.push(xValues[xValues.length - 1]);
          break;
        case "addx":
          xValues.push(xValues[xValues.length - 1]);
          xValues.push(xValues[xValues.length - 1] + Number(argument));
          break;
        default:
          throw new Error(`Unknown instruction ${name}`);
      }
      return xValues;
    },
    [1]
  );
}

function signalStrengths(xs) {
  return xs.map((x, i) => x * (i + 1));
}

function drawImage(xs) {
  const imageContents = xs.map((x, i) => {
    return x >= (i % 40) - 1 && x <= (i % 40) + 1 ? "#" : ".";
  });
  return group(40, imageContents).map((line) => line.join(""));
}
