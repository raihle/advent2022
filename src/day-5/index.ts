import { chunkList } from "../utils/chunk-list";

type Instruction = { count: number; from: number; to: number };
type Stack = string[];

export async function test() {
  main([
    "    [D]    ",
    "[N] [C]    ",
    "[Z] [M] [P]",
    " 1   2   3 ",
    "",
    "move 1 from 2 to 1",
    "move 3 from 1 to 3",
    "move 2 from 2 to 1",
    "move 1 from 1 to 2",
  ]);
}

export async function main(input: string[]) {
  const [crateInput, instructionInput] = chunkList(input, (item) => item == "");
  const instructions = parseInstructions(instructionInput);

  const stacksA = parseStacks(crateInput);
  const stacksB = parseStacks(crateInput);
  applyA(instructions, stacksA);
  applyB(instructions, stacksB);
  console.log("A: ", stacksA.map(last).join(""));
  console.log("B: ", stacksB.map(last).join(""));
}

function parseStacks(crateInput: string[]): Stack[] {
  const stackCount = (crateInput[0].length + 1) / 4;
  const stacks = [];
  repeat(stackCount, () => stacks.push([]));
  new Array(stackCount).map(() => []);
  const crateRegex = /(?:   |\[(\w)\])(?: |$)/g;
  for (let i = crateInput.length - 2; i >= 0; i--) {
    const line = crateInput[i];
    const crates = line.matchAll(crateRegex);
    let j = 0;
    for (const crate of crates) {
      if (crate[1]) {
        stacks[j].push(crate[1]);
      }
      j++;
    }
  }
  return stacks;
}

function parseInstructions(instructionInput: string[]): Instruction[] {
  return instructionInput.map(parseInstruction);
}

function parseInstruction(line: string): Instruction {
  // "move 1 from 2 to 1",
  const [, count, , from, , to] = line.split(" ");
  return { count: Number(count), from: Number(from) - 1, to: Number(to) - 1 };
}

function applyA(instructions: Instruction[], stacks: Stack[]) {
  for (const { count, from, to } of instructions) {
    repeat(count, () => stacks[to].push(stacks[from].pop()));
  }
}

function applyB(instructions: Instruction[], stacks: Stack[]) {
  for (const { count, from, to } of instructions) {
    const crane = [];
    repeat(count, () => crane.push(stacks[from].pop()));
    repeat(count, () => stacks[to].push(crane.pop()));
  }
}

function repeat(n: number, fn: (time: number) => void) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}

function last<T>(list: T[]): T {
  return list[list.length - 1];
}
