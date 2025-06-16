import { loadDictionary } from "../lambda/loadDictionary";

test("dictionary loads from .txt file into set", () => {
  const dictionary: Set<string> = loadDictionary();

  expect(dictionary.size).toBeGreaterThan(0);
  expect(dictionary.has("flowers")).toBeTruthy;
  expect(dictionary.has("forevermore")).toBeFalsy;
});
