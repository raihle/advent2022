import { chunkList } from "../utils/chunk-list";
import { max } from "../utils/max";
import { sum } from "../utils/sum";

type Elf = number[];

export function test() {
  main([
    "1000",
    "2000",
    "3000",
    "",
    "4000",
    "",
    "5000",
    "6000",
    "",
    "7000",
    "8000",
    "9000",
    "",
    "10000",
  ]);
}

export function main(input: string[]) {
  const elves: Elf[] = chunkList(input, (item) => item == "").map((carried) =>
    carried.map(Number)
  );
  console.log("A:", mostCaloriesCarriedByAnyElf(elves));
  console.log("B:", caloriesCarriedByTopThreeElves(elves));
}

function mostCaloriesCarriedByAnyElf(elves: Elf[]): number {
  return max(elves.map(sum));
}

function caloriesCarriedByTopThreeElves(elves: Elf[]): number {
  return sum(
    elves
      .map(sum)
      .sort((a, b) => b - a)
      .slice(0, 3)
  );
}
