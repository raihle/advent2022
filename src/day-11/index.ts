import { chunkList } from "../utils/chunk-list";
import { product } from "../utils/product";
import { repeat } from "../utils/repeat";

export async function test() {
  main([
    "Monkey 0:",
    "Starting items: 79, 98",
    "Operation: new = old * 19",
    "Test: divisible by 23",
    "If true: throw to monkey 2",
    "If false: throw to monkey 3",
    "",
    "Monkey 1:",
    "Starting items: 54, 65, 75, 74",
    "Operation: new = old + 6",
    "Test: divisible by 19",
    "If true: throw to monkey 2",
    "If false: throw to monkey 0",
    "",
    "Monkey 2:",
    "Starting items: 79, 60, 97",
    "Operation: new = old * old",
    "Test: divisible by 13",
    "If true: throw to monkey 1",
    "If false: throw to monkey 3",
    "",
    "Monkey 3:",
    "Starting items: 74",
    "Operation: new = old + 3",
    "Test: divisible by 17",
    "If true: throw to monkey 0",
    "If false: throw to monkey 1",
  ]);
}

type Monkey = {
  heldItems: number[];
  handledItemsCount: number;
  operation: (worry: number) => number;
  testDivisor: number;
  ifTrue: number;
  ifFalse: number;
};

export async function main(input: string[]) {
  const monkeyData = chunkList(
    input.map((line) => line.trim()),
    (line) => line == ""
  );
  const monkeys = parseMonkeyData(monkeyData);
  console.log(
    "A: ",
    product(
      simulateRounds(monkeys, 20, divideBy(3))
        .sort((a, b) => b.handledItemsCount - a.handledItemsCount)
        .slice(0, 2)
        .map((monkey) => monkey.handledItemsCount)
    )
  );
  const multipleOfTests = product(monkeys.map((monkey) => monkey.testDivisor));
  console.log(
    "B: ",
    product(
      simulateRounds(monkeys, 10000, remainderOf(multipleOfTests))
        .sort((a, b) => b.handledItemsCount - a.handledItemsCount)
        .slice(0, 2)
        .map((monkey) => monkey.handledItemsCount)
    )
  );
}

function parseMonkeyData(monkeysData: string[][]): Monkey[] {
  /*
    "Monkey 0:",
    "Starting items: 79, 98",
    "Operation: new = old * 19",
    "Test: divisible by 23",
    "If true: throw to monkey 2",
    "If false: throw to monkey 3",
    */
  return monkeysData.map((monkeyData) => ({
    heldItems: monkeyData[1].split(": ")[1].split(", ").map(Number),
    handledItemsCount: 0,
    operation: makeOperation(monkeyData[2]),
    testDivisor: Number(monkeyData[3].split("by ")[1]),
    ifTrue: Number(monkeyData[4].split("monkey ")[1]),
    ifFalse: Number(monkeyData[5].split("monkey ")[1]),
  }));
}

function makeOperation(line: string): Monkey["operation"] {
  // "Operation: new = old * 19",
  const [, , , , operator, rawOperand] = line.split(" ");
  const operand = Number(rawOperand);
  switch (operator) {
    case "*":
      return (old: number) => old * (isNaN(operand) ? old : operand);
    case "/":
      return (old: number) => old / (isNaN(operand) ? old : operand);
    case "+":
      return (old: number) => old + (isNaN(operand) ? old : operand);
    case "-":
      return (old: number) => old - (isNaN(operand) ? old : operand);
    default:
      throw new Error(`Unknown operator ${operator}`);
  }
}

function simulateRounds(
  monkeys: Monkey[],
  rounds: number,
  worryReducer: (worry: number) => number
): Monkey[] {
  let acc = monkeys;
  repeat(rounds, () => (acc = simulateOneRound(acc, worryReducer)));
  return acc;
}

function divideBy(divisor: number) {
  return (worry: number) => Math.floor(worry / divisor);
}

function remainderOf(divisor: number) {
  return (worry: number) => worry % divisor;
}

function simulateOneRound(
  monkeys: Monkey[],
  worryReducer: (worry: number) => number
): Monkey[] {
  const acc: Monkey[] = monkeys.map(copyMonkey);
  for (const monkey of acc) {
    for (let item of monkey.heldItems) {
      monkey.handledItemsCount++;
      item = worryReducer(monkey.operation(item));
      throwItem(monkey, item, acc);
    }
    monkey.heldItems = [];
  }
  return acc;
}

function copyMonkey(monkey: Monkey): Monkey {
  return {
    ...monkey,
    heldItems: [...monkey.heldItems],
  };
}

function throwItem(from: Monkey, item: number, monkeys: Monkey[]) {
  if (item % from.testDivisor == 0) {
    monkeys[from.ifTrue].heldItems.push(item);
  } else {
    monkeys[from.ifFalse].heldItems.push(item);
  }
}
