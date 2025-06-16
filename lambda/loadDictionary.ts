import * as fs from "fs";
import * as path from "path";

// Creates Set from .txt file of English words
export function loadDictionary(): Set<string> {
  const dictionaryPath = path.join(__dirname, "dictionary.txt");
  const content = fs.readFileSync(dictionaryPath, "utf-8");
  const words = content.split("\n").map((w) => w.trim().toLowerCase());
  return new Set(words);
}
