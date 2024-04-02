import { Gabarito } from "next/font/google";

import { wordList } from "./constants/words";

export const gab = Gabarito({
  subsets: ["latin"],
  adjustFontFallback: false,
});

export const congratulationsMessages = [
  'Congratulations!',
  'Well Done!',
  'Great Job!',
  'You Did It!',
  'Awesome!',
  'Amazing!',
  'Fantastic!',
  'Incredible!',
  'Congrats!',
  'Nice Work!',
  'Bravo!',
  'Excellent!',
  'Superb!',
  'Impressive!',
  'Outstanding!',
  'Terrific!',
  'Spectacular!',
  'Phenomenal!',
  'Marvelous!',
  'Splendid!',
  'Magnificent!',
  'Youuuuu did it!',
  'Winner!',
]

export const startingLocations = [
  0, 1, 2, 3, 8
]

export const newGame = (customList?: string[]) => {
  customList = Array.from(new Set([...customList || wordList]));

  // get 20 random words from the word list, and ensure they are unique. put them in positions 0, 1, 2, 3, 8. 
  const words = [...customList].sort(() => Math.random() - 0.5).slice(0, 20);
  const leaves = startingLocations.map((location, key) => {
    return {
      id: key + 1,
      words: words.slice(key * 4, (key + 1) * 4),
      rotation: 0,
      position: location
    }
  });
  return {
    entries: [...Array(4)].map(() => ''),
    rotation: 0,
    attempts: 0,
    leaves,
    congratulationsMessage: congratulationsMessages[Math.floor(Math.random() * congratulationsMessages.length)]
  }
}

export function encodeJsonObject(jsonObject: object): string {
  const jsonString = JSON.stringify(jsonObject);
  const base64String = Buffer.from(jsonString).toString('base64');
  const urlSafeBase64String = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return urlSafeBase64String;
}

// Function to decode a URL-safe Base64 string back to a JSON object
export const decodeJsonObject = (urlSafeBase64String: string): object => {
  // Convert the URL-safe Base64 string back to a regular Base64 string
  let base64String = urlSafeBase64String.replace(/-/g, '+').replace(/_/g, '/');
  // Padding may be required for correct decoding
  while (base64String.length % 4) {
    base64String += '=';
  }
  // Decode the Base64 string to a JSON string
  const jsonString = Buffer.from(base64String, 'base64').toString();
  // Parse the JSON string back into an object
  const jsonObject = JSON.parse(jsonString);
  return jsonObject;
}