import { getCombinations, rankCombinations } from "../lambda/handler";

test("getCombinations and rankCombinations returns best possible options", () => {
  const combinations = getCombinations("3569377");

  expect(combinations.length).toBeGreaterThan(0);
  expect(combinations.includes("FLOWERS")).toBeTruthy();

  const best = rankCombinations(combinations);

  console.log(best);

  expect(best.includes("FLOWERS")).toBeTruthy();
});
