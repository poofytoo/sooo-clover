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
