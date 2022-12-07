import { chunkList } from "../utils/chunk-list";
import { max } from "../utils/max";
import { readInput } from "../utils/read-input";
import { sum } from "../utils/sum";

type Elf = number[];

export async function main(input: string[]) {
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
