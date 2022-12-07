import { sum } from "../utils/sum";

type Move = "Rock" | "Paper" | "Scissors";
type Outcome = "Win" | "Tie" | "Loss";
type Input = "A" | "B" | "C" | "X" | "Y" | "Z";

const inputToMove: Record<Input, Move> = {
  A: "Rock",
  X: "Rock",
  B: "Paper",
  Y: "Paper",
  C: "Scissors",
  Z: "Scissors",
};

const inputToOutcome: Record<"X" | "Y" | "Z", Outcome> = {
  X: "Loss",
  Y: "Tie",
  Z: "Win",
};

const moveValues: Record<Move, number> = {
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};

const outcomeValues: Record<Outcome, number> = {
  Win: 6,
  Tie: 3,
  Loss: 0,
};

const wins: Record<Move, Move> = {
  Rock: "Scissors",
  Paper: "Rock",
  Scissors: "Paper",
};

export async function test() {
  console.log("A Y", scoreA("A Y"), scoreB("A Y"));
  console.log("B X", scoreA("B X"), scoreB("B X"));
  console.log("C Z", scoreA("C Z"), scoreB("C Z"));
  main(["A Y", "B X", "C Z"]);
}
export async function main(input: string[]) {
  console.log("A: ", sum(input.map(scoreA)));
  console.log("B: ", sum(input.map(scoreB)));
}

function scoreA(round: string) {
  const opponent = inputToMove[round.substring(0, 1)];
  const me = inputToMove[round.substring(2, 3)];
  const result = outcome(me, opponent);
  return outcomeValues[result] + moveValues[me];
}

function scoreB(round: string) {
  const opponent = inputToMove[round.substring(0, 1)];
  const result = inputToOutcome[round.substring(2, 3)];
  const me = moveToPlay(opponent, result);
  return outcomeValues[result] + moveValues[me];
}

/** The outcome of a round from A's perspective */
function outcome(a: Move, b: Move): Outcome {
  if (a == b) {
    return "Tie";
  }
  if (wins[a] == b) {
    return "Win";
  }
  if (wins[b] == a) {
    return "Loss";
  }
  throw new Error(`Unknown outcome: ${a} vs ${b}`);
}

function moveToPlay(opponent: Move, desiredOutcome: Outcome) {
  if (desiredOutcome == "Tie") {
    return opponent;
  }
  if (desiredOutcome == "Loss") {
    return wins[opponent];
  }
  return Object.keys(wins).find((move) => wins[move] == opponent);
}
