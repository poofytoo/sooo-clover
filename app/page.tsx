'use client'

import { Clover } from '@/components/Clover'
import styles from './page.module.css'
import { useEffect, useState } from 'react';
import { CloverState } from '@/types';
import { pokemonList } from '@/constants/pokemon';
import { wordList } from '@/constants/words';
import { congratulationsMessages } from '@/utils';
import { Button } from '@/components/Button';
import { hardList } from '@/constants/hard';

export type GameState = "SELECTING_GAME" | "CLUING" | "GUESSING" | "REVEALED";

const startingLocations = [
  0, 1, 2, 3, 8
]

const newGame = (customList?: string[]) => {

  customList = customList || wordList;

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
    leaves,
    congratulationsMessage: congratulationsMessages[Math.floor(Math.random() * congratulationsMessages.length)]
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
  const [gameState, setGameState] = useState<GameState>("SELECTING_GAME");

  useEffect(() => {
    setCloverState(newGame());
  }, []);

  return <div className={styles.main}>
    {gameState === "SELECTING_GAME" &&
      <div className={styles.startContainer}>
        <h1>Sooo Clover</h1>
        <div className={styles.buttonContainer}>
          <div>
            <Button onClick={() => {
              setCloverState(newGame());
              setGameState("CLUING");
            }}>New Game</Button>
          </div>
          <div>
            <Button onClick={() => {
              setCloverState(newGame(pokemonList))
              setGameState("CLUING")
            }}>New Game <span className="dem">(Pokemon)</span></Button>
          </div>
          <div>
            <Button onClick={() => {
              setCloverState(newGame(hardList))
              setGameState("CLUING")
            }}>New Game <span className="dem">(Hard Words)</span></Button>
          </div>
          <div>
            <Button onClick={() => {
              setCloverState(newGame(Array.from(new Set([...wordList, ...hardList, ...pokemonList]))));
              setGameState("CLUING");
            }}>New Game <span className="dem">(All)</span></Button>
          </div>
        </div>
      </div>
    }
    {
      gameState !== "SELECTING_GAME" && <div>
        <Clover
          cloverState={cloverState}
          setCloverState={setCloverState}
          gameState={gameState}
          setGameState={setGameState}
        />
      </div>
    }
  </div >
}
