import { readFile } from "fs/promises";
import type Module from "module";
import { resolve } from "path";

export async function readInput(
  inputName: string = "input.txt"
): Promise<string[]> {
  const input = (
    await readFile(resolve((require.main as Module).path, inputName), "utf-8")
  ).split("\n");
  return input.slice(0, input.length - 1);
}
