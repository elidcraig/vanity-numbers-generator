import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { loadDictionary } from "./loadDictionary";

// Set of common English words
const DICTIONARY: Set<string> = loadDictionary();

// Used to convert phone digits to possible letter options
const DIGIT_TO_LETTERS: Record<string, string[]> = {
  "2": ["A", "B", "C"],
  "3": ["D", "E", "F"],
  "4": ["G", "H", "I"],
  "5": ["J", "K", "L"],
  "6": ["M", "N", "O"],
  "7": ["P", "Q", "R", "S"],
  "8": ["T", "U", "V"],
  "9": ["W", "X", "Y", "Z"],
};

const client = new DynamoDBClient({});

export const handler = async (event: any, context?: any, callback?: any) => {
  const phoneNumber =
    event.Details.ContactData.CustomerEndpoint.Address.replace(/[^\d]/g, "");
  // should update to check if number already exists in table here

  // area code is ignored in generating combinations
  const areaCodePrefix = phoneNumber.substring(0, 4);
  const combinations = getCombinations(
    phoneNumber.substring(4, phoneNumber.length)
  );
  // after ranking, top 5 results are returned, and area code is added back on
  let bestVanityNumbers = rankCombinations(combinations).map(
    (vanity) => areaCodePrefix + vanity
  );

  // best 5 options are added to DynamoDB table
  // entry is stored with original phone number for lookup
  await client.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME!,
      Item: {
        phoneNumber: { S: phoneNumber },
        suggestions: { SS: bestVanityNumbers },
      },
    })
  );

  // data is formatted to send best 3 options to Connect contact flow
  // could be clarified by having Connect flow prompt expect the data in same format as DynamoDB
  const resultMap = {
    optionOne: bestVanityNumbers[0],
    optionTwo: bestVanityNumbers[1],
    optionThree: bestVanityNumbers[2],
  };
  callback(null, resultMap);
};

// function called recursively to generate all possible vanity options
export function getCombinations(
  phone: string,
  index = 0,
  prefix = "",
  result: string[] = []
): string[] {
  if (index === phone.length) return result;
  const digit = phone[index];
  const letters = DIGIT_TO_LETTERS[digit] || [digit];

  for (const char of letters) {
    const next = prefix + char;
    if (index === phone.length - 1) result.push(next);
    else getCombinations(phone, index + 1, next, result);
  }

  return result;
}

export function rankCombinations(vanityOptions: string[]): string[] {
  // Assigns score to option
  const scored = vanityOptions.map((vanity) => ({
    vanity,
    score: scoreVanity(vanity),
  }));

  // Sorts by descending score
  scored.sort((a, b) => b.score - a.score);
  // Returns best 5
  return scored.slice(0, 5).map((entry) => entry.vanity);
}

export function scoreVanity(vanity: string): number {
  let score = 0;

  for (let len = 7; len >= 3; len--) {
    for (let i = 0; i <= vanity.length - len; i++) {
      const fragment = vanity.substring(i, i + len);
      // Look for real words in substrings
      if (DICTIONARY.has(fragment.toLowerCase())) {
        // reward longer words more
        score += len * 10;
      }
    }
  }
  return score;
}
