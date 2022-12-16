/**
 * Returns a list of all combinations of the given lists.
 * E.g. combinations([[1, 2], [3, 4]]) => [[1, 3], [1, 4], [2, 4], [2, 4]]
 * The order of combinations is not guaranteed, but the Nth item in a combination is always from the Nth list in the input.
 */
export function combinations<T>(lists: T[][]): T[][] {
  if (lists.length <= 1) {
    return lists[0].map((item) => [item]);
  }
  const firstList = lists[0];
  const remainingLists = lists.slice(1);
  const remainingListCombinations = combinations(remainingLists);
  return firstList.flatMap((first) =>
    remainingListCombinations.map((rc) => [first].concat(rc))
  );
}
