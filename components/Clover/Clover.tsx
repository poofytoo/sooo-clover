'use client';

import { TextInput } from '../TextInput';
import { useState } from 'react';

import styles from './Clover.module.css'
import cx from "classnames";

import { wordList } from '@/constants';
import Leaf from '../Leaf/Leaf';
import { LeafPlaceholder } from '../LeafPlaceholder';

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CwIcon } from '@/icons/Rotate';


interface LeafState {
  words: string[];
  rotation: number;
  position: number;
  id: number;
}

interface CloverState {
  entries: string[];
  rotation: number;
  leaves: LeafState[];
}

export const Clover = () => {
  const [showIcon, setShowIcon] = useState(false);
  const [gameState, setGameState] = useState<CloverState>({
    entries: [...Array(4)].map(() => ''),
    rotation: 0,
    leaves: [
      { id: 1, words: ['apple', 'banana', 'cranberry', 'durian'], rotation: 0, position: 4 },
      { id: 2, words: ['elderberry', 'fig', 'grape', 'honeydew'], rotation: 0, position: 5 },
      { id: 3, words: ['kiwi', 'lemon', 'mango', 'nectarine'], rotation: 0, position: 6 },
      { id: 4, words: ['orange', 'pear', 'quince', 'raspberry'], rotation: 0, position: 7 },
      { id: 5, words: ['strawberry', 'tangerine', 'ugli', 'vanilla'], rotation: 0, position: 8 },
    ]
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id === over.id) {
      return;
    }

    const leafIndex = gameState.leaves.findIndex((_, key) => {
      return key + 1 === active.id
    });

    const newPosition = parseInt(over.id.replace('spot', ''));

    // check to see if there's a leaf already in the new position
    const existingLeafAtNewPosition = gameState.leaves.find(leaf => leaf.position === newPosition);

    // get old position of leaf
    const removedFromPosition = gameState.leaves[leafIndex].position;


    const newLeaves = [...gameState.leaves];
    newLeaves[leafIndex].position = newPosition;

    if (existingLeafAtNewPosition) {
      existingLeafAtNewPosition.position = removedFromPosition;
    }

    // because when it's dragged into the gamestate, the gamestate may have a rotation, and it's suddenly applied to the leaf. trick is to subtract the rotation from the leaf's rotation such that the leaf's rotation doesn't look like it's changing when being dragged in. However, do this ONLY if the leaf started in the leaf bank.
    if (removedFromPosition >= 4) {
      newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation - gameState.rotation + 4) % 4;
    }

    // converself if it's dragged from the clover back to the leaf bank, add the rotation back
    if (newPosition >= 4) {
      newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation + gameState.rotation) % 4;
    }

    setGameState({
      ...gameState,
      leaves: newLeaves
    });
  }

  const getEntryValue = (index: number) => {
    return gameState.entries[(index + gameState.rotation) % 4];
  }

  const setEntryValue = (index: number, value: string) => {
    const entries = [...gameState.entries];
    entries[(index + gameState.rotation) % 4] = value;
    setGameState({
      ...gameState,
      entries: entries
    });
  }

  const getWordsPosition = (leafId: number, words: string[]) => {
    const leaf = gameState.leaves.find(leaf => leaf.id === leafId);
    if (!leaf) {
      return [];
    }
    const rotation = (leaf.rotation + (leaf.position <= 3 ? gameState.rotation : 0)) % 4;
    return words.map((_, index) => {
      return words[(index + rotation) % 4];
    });
  }

  const rotateLeaf = (id: number) => {
    return (direction: number) => {
      return () => {
        const newLeaves = [...gameState.leaves];
        const leafIndex = gameState.leaves.findIndex(leaf => leaf.id === id);
        newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation + direction) % 4;
        setGameState({
          ...gameState,
          leaves: newLeaves
        });
      }
    }
  };

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(
    pointerSensor
  )

  return <DndContext
    onDragEnd={handleDragEnd}
    sensors={sensors}
  >
    <div>
      <button onClick={(e) => {
        setShowIcon(true);
        setTimeout(() => {
          setShowIcon(false);
        }, 100);
        setGameState({
          ...gameState,
          rotation: (gameState.rotation + 3) % 4
        })
      }}
      >Rotate</button>
    </div>
    <div className={styles.centerContainer}>
      <div className={styles.cloverContainer}>
        <div></div>
        <div><TextInput
          value={getEntryValue(0)}
          setValue={(value) => {
            setEntryValue(0, value);
          }}
        /></div>
        <div></div>
        <div className={cx(styles.ccw, styles.verticalText)}><TextInput
          value={getEntryValue(3)}
          setValue={(value) => {
            setEntryValue(3, value);
          }}
        /></div>
        <div className={styles.centerContainer}>
          <div className={styles.leavesContainer}>
            {[0, 1, 3, 2].map((i) => {
              const key = (i + gameState.rotation) % 4;
              const childLeaf = gameState.leaves.find(leaf => leaf.position === key);
              return <div className={styles.leafContainer} key={key}>
                <LeafPlaceholder id={"spot" + key} >
                  {
                    childLeaf ? <Leaf
                      onClick={rotateLeaf(childLeaf.id)}
                      words={getWordsPosition(childLeaf.id, childLeaf!.words)}
                      id={childLeaf.id}
                    /> : null
                  }
                </LeafPlaceholder>
              </div>
            }
            )}
          </div>
          <div className={cx(styles.iconContainer, {
            [styles.showIcon]: showIcon
          })}>
            <CwIcon />
          </div>
        </div>
        <div className={cx(styles.cw, styles.verticalText)}><TextInput
          value={getEntryValue(1)}
          setValue={(value) => {
            setEntryValue(1, value);
          }}
        /></div>
        <div></div>
        <div>
          <TextInput
            value={getEntryValue(2)}
            setValue={(value) => {
              setEntryValue(2, value);
            }}
          /></div>
        <div></div>
      </div>
      <div className={styles.leafBank}>
        {[...Array(5)].map((_, key) => {
          const childLeaf = gameState.leaves.find(leaf => leaf.position === key + 4);
          return <LeafPlaceholder key={key} id={"spot" + (key + 4)}>
            {
              childLeaf ? <Leaf
                onClick={rotateLeaf(childLeaf.id)}
                words={getWordsPosition(childLeaf.id, childLeaf!.words)}
                id={childLeaf.id}
              /> : null
            }
          </LeafPlaceholder>
        }
        )}
      </div>
    </div>
  </DndContext >
}