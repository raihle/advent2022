export async function test() {
  main([
    "bvwbjplbgvbhsrlpgdmjqwftvncz",
    "nppdvjthqldpwncqszvftbrmjlhg",
    "nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg",
    "zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw",
  ]);
}

export async function main(input: string[]) {
  console.log("A: ", input.map(findPacketStartIndex));
  console.log("B: ", input.map(findMessageStartIndex));
}

function findPacketStartIndex(word: string) {
  return findIndexOfNonRepeatingCharacters(4, word);
}

function findMessageStartIndex(word: string) {
  return findIndexOfNonRepeatingCharacters(14, word);
}

function findIndexOfNonRepeatingCharacters(charCount: number, line: string) {
  let chars = "";
  let start = -1;
  do {
    start++;
    chars = line.substring(start, start + charCount);
  } while (hasDuplicateChar(chars));
  return start + charCount;
}

function hasDuplicateChar(word: string) {
  for (let i = 0; i < word.length; i++) {
    if (word.lastIndexOf(word.charAt(i)) != i) {
      return true;
    }
  }
  return false;
}
