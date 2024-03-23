'use client'

import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { Clover } from '@/components/Clover'
import { hardList } from '@/constants/hard';
import { pokemonList } from '@/constants/pokemon';
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
      localStorage.setItem('clover', JSON.stringify({ gameState, cloverState }));
    } else if (gameState === "REVEALED") {
      localStorage.removeItem('clover');
    }
  }, [gameState, cloverState]);

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
