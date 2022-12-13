import { chunkList } from "../utils/chunk-list";
import { product } from "../utils/product";
import { repeat } from "../utils/repeat";

export async function test() {
  main([
    "[1,1,3,1,1]",
    "[1,1,5,1,1]",
    "",
    "[[1],[2,3,4]]",
    "[[1],4]",
    "",
    "[9]",
    "[[8,7,6]]",
    "",
    "[[4,4],4,4]",
    "[[4,4],4,4,4]",
    "",
    "[7,7,7,7]",
    "[7,7,7]",
    "",
    "[]",
    "[3]",
    "",
    "[[[]]]",
    "[[]]",
    "",
    "[1,[2,[3,[4,[5,6,7]]]],8,9]",
    "[1,[2,[3,[4,[5,6,0]]]],8,9]",
  ]);
}

type Packet = Array<Packet | number>;

export async function main(input: string[]) {
  const packets = input.map((line) => new Function(`return ${line}`)());
  const packetPairs = chunkList(packets, (item) => item == undefined);
  console.log(
    "A: ",
    packetPairs
      .map((chunk) => compareOrder(chunk[0], chunk[1]))
      .reduce(sumIndicesIfOrdered, 0)
  );
  console.log(
    "B: ",
    findDecoderPackets(
      packets
        .filter((p) => p != undefined)
        .concat([[[2]], [[6]]])
        .sort((a, b) => -compareOrder(a, b))
    )
  );
}

type OrderDecision = -1 | 0 | 1;
function compareOrder(left: Packet, right: Packet): number {
  for (let i = 0; i < left.length; i++) {
    if (i >= right.length) return -1;
    const l = left[i],
      r = right[i];
    if (Array.isArray(l)) {
      if (Array.isArray(r)) {
        const decision = compareOrder(l, r);
        if (decision != 0) return decision;
      } else {
        const decision = compareOrder(l, [r]);
        if (decision != 0) return decision;
      }
    } else if (Array.isArray(r)) {
      const decision = compareOrder([l], r);
      if (decision != 0) return decision;
    } else {
      const decision = Math.sign(r - l);
      if (decision != 0) return decision;
    }
  }
  return right.length > left.length ? 1 : 0;
}

function sumIndicesIfOrdered(acc: number, item: OrderDecision, i: number) {
  return item == 1 ? acc + (i + 1) : acc;
}

function findDecoderPackets(packets: Packet[]) {
  const indices = [];
  for (let i = 0; i < packets.length; i++) {
    const packet = packets[i];
    if (
      packet.length == 1 &&
      Array.isArray(packet[0]) &&
      packet[0].length == 1 &&
      (packet[0][0] == 2 || packet[0][0] == 6)
    ) {
      indices.push(i + 1);
    }
  }
  return product(indices);
}
