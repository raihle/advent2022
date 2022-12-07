import { readInput } from "./utils/read-input";

async function run() {
  const mode = process.argv[2]; 
  const day = process.argv[3];
  if (!day) {
    console.error("Provide a day to run, e.g. 'npm start 1'");
    process.exit(1);
  }
  if (mode == "run") {
    const { main } = require(`./day-${day}`);
    const input = await readInput(`day-${day}/input.txt`);
    main(input);
  } else if (mode == "test") {
    const { test } = require(`./day-${day}`);
    test();
  }
}

run();
