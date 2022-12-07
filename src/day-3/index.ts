import { group } from "../utils/group";
import { intersection } from "../utils/intersection";
import { sum } from "../utils/sum";

type Compartment = string[];

export async function test() {
  main([
    "vJrwpWtwJgWrhcsFMMfFFhFp",
    "jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL",
    "PmmdzqPrVvPwwTWBwg",
    "wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn",
    "ttgJtRGJQctTZtZT",
    "CrZsJsPPZsGzwwsLwLmpwMDw",
  ]);
}
export async function main(input: string[]) {
  console.log(
    "A: ",
    sum(input.flatMap((line) => intersection(compartments(line)).map(priority)))
  );
  console.log(
    "B: ",
    sum(
      group(3, input).flatMap((lines) =>
        intersection(lines.map(items)).map(priority)
      )
    )
  );
}

function items(line: string) {
  return line.split("");
}

function priority(letter: string) {
  const charCode = letter.charCodeAt(0);
  if (letter >= "a") {
    return charCode - 96;
  }
  return charCode - 38;
}

function compartments(rucksack: string): Compartment[] {
  return [
    items(rucksack.substring(0, rucksack.length / 2)),
    items(rucksack.substring(rucksack.length / 2)),
  ];
}
