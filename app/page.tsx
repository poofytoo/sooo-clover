'use client'

import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Clover } from '@/components/Clover'
import { hardList } from '@/constants/hard';
import { pokemonList } from '@/constants/pokemon';
import { tacoBell } from '@/constants/tacoBell';
import { wordList } from '@/constants/words';
import { CloverState, GameState } from '@/types';
import { congratulationsMessages, newGame, startingLocations } from '@/utils';

import styles from './page.module.css'

const blankGame = () => ({
  entries: [...Array(4)].map(() => ''),
  rotation: 0,
  leaves: startingLocations.map((location) => {
    return { id: 0, words: [], rotation: 0, position: location }
  }),
  attempts: 0,
});

const wordSets = [
  {
    words: wordList,
    name: "Normal"
  },
  {
    words: pokemonList,
    name: "Pokemon"
  },
  {
    words: hardList,
    name: "Hard Words"
  },
  {
    words: tacoBell,
    name: "Taco Bell"
  },
]

// add all words together in a all words list
const allWords = wordSets.reduce((acc: string[], set) => {
  return [...acc, ...set.words]
}, [])

wordSets.push({
  words: allWords,
  name: "All"
});

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const clover = localStorage.getItem('clover');
    if (clover) {
      const { gameState, cloverState } = JSON.parse(clover);
      return { gameState, cloverState };
    } else {
      return { gameState: "SELECTING_GAME", cloverState: blankGame() }
    }
  } else {
    return { gameState: "SELECTING_GAME", cloverState: blankGame() }
  }
}

export default function Home() {
  const [cloverState, setCloverState] = useState<CloverState>(blankGame());
  const [gameState, setGameState] = useState<GameState>("SELECTING_GAME");

  useEffect(() => {
    const { gameState, cloverState } = getInitialState();
    setGameState(gameState);
    setCloverState(cloverState);
  }, []);

  useEffect(() => {
    if (gameState === "CLUING" && cloverState.entries.every(entry => entry === "")) {
      // check if entries are all "" 
      localStorage.removeItem('clover');
    } else if (gameState !== "SELECTING_GAME" && gameState !== "REVEALED") {
      const cleanedCloverState = { ...cloverState };
      // remove showingIncorrect from all leaves
      cleanedCloverState.leaves = cleanedCloverState.leaves.map(leaf => {
        return { ...leaf, showIncorrect: false }
      });
      localStorage.setItem('clover', JSON.stringify({
        gameState,
        cloverState: cleanedCloverState
      }));
    } else if (gameState === "REVEALED") {
      localStorage.removeItem('clover');
    }
  }, [gameState, cloverState]);

  return <div className={styles.main}>
    {gameState === "SELECTING_GAME" &&
      <div className={styles.startContainer}>
        <h1>Sooo Clover</h1>
        <div className={styles.buttonContainer}>
          {
            wordSets.map((set, key) => {
              return <div key={key}>
                <Button onClick={() => {
                  setCloverState(newGame(set.words));
                  setGameState("CLUING");
                }}>New Game <span className="dem">({set.name})</span></Button>
              </div>
            })
          }
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
