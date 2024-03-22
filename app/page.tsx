'use client'

import { Clover } from '@/components/Clover'
import styles from './page.module.css'
import { useEffect, useState } from 'react';
import { CloverState } from '@/types';
import { wordList } from '@/constants';

export type GameState = "CLUING" | "GUESSING" | "REVEALED";


const TESTING_STATE = {
  entries: [...Array(4)].map(() => ''),
  rotation: 0,
  leaves: [
    { id: 1, words: ['apple', 'banana', 'cranberry', 'durian'], rotation: 0, position: 4 },
    { id: 2, words: ['elderberry', 'fig', 'grape', 'honeydew'], rotation: 0, position: 5 },
    { id: 3, words: ['kiwi', 'lemon', 'mango', 'nectarine'], rotation: 0, position: 6 },
    { id: 4, words: ['orange', 'pear', 'quince', 'raspberry'], rotation: 0, position: 7 },
    { id: 5, words: ['strawberry', 'tangerine', 'ugli', 'vanilla'], rotation: 0, position: 8 },
  ]
}

const startingLocations = [
  0, 1, 2, 3, 8
]

const newGame = () => {

  // get 20 random words from the word list, and ensure they are unique. put them in positions 0, 1, 2, 3, 8. 
  const words = [...wordList].sort(() => Math.random() - 0.5).slice(0, 20);
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
    leaves
  }
}

const blankGame = () => ({
  entries: [...Array(4)].map(() => ''),
  rotation: 0,
  leaves: startingLocations.map((location) => {
    return { id: 0, words: [], rotation: 0, position: location }
  })
});

export default function Home() {
  const [cloverState, setCloverState] = useState<CloverState>(blankGame());
  const [gameState, setGameState] = useState<GameState>("CLUING");

  useEffect(() => {
    setCloverState(newGame());
  }, []);

  return <div className={styles.main}>
    <Clover
      cloverState={cloverState}
      setCloverState={setCloverState}
      gameState={gameState}
      setGameState={setGameState}
    />
  </div>
}
