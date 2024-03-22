'use client';

import { TextInput } from '../TextInput';
import { useState } from 'react';

import styles from './Clover.module.css'
import cx from "classnames";

// import { wordList } from '@/constants/pokemon';

import Leaf from '../Leaf/Leaf';
import { LeafPlaceholder } from '../LeafPlaceholder';
import { Celebrate } from '../Celebrate';

import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CwIcon } from '@/icons/Rotate';
import { CloverState, LeafState } from '@/types';
import { GameState } from '@/app/page';

export const Clover = ({
  cloverState,
  setCloverState,
  gameState,
  setGameState
}: {
  cloverState: CloverState,
  setCloverState: (state: CloverState) => void
  gameState: GameState,
  setGameState: (state: GameState) => void
}) => {
  const [showIcon, setShowIcon] = useState(false);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id === over.id) {
      return;
    }

    const leafIndex = cloverState.leaves.findIndex((_, key) => {
      return key + 1 === active.id
    });

    const newPosition = parseInt(over.id.replace('spot', ''));

    // check to see if there's a leaf already in the new position
    const existingLeafAtNewPosition = cloverState.leaves.find(leaf => leaf.position === newPosition);

    // get old position of leaf
    const removedFromPosition = cloverState.leaves[leafIndex].position;


    const newLeaves = [...cloverState.leaves];
    newLeaves[leafIndex].position = newPosition;

    if (existingLeafAtNewPosition) {
      existingLeafAtNewPosition.position = removedFromPosition;
    }

    // because when it's dragged into the gamestate, the gamestate may have a rotation, and it's suddenly applied to the leaf. trick is to subtract the rotation from the leaf's rotation such that the leaf's rotation doesn't look like it's changing when being dragged in. However, do this ONLY if the leaf started in the leaf bank.
    if (removedFromPosition >= 4) {
      newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation - cloverState.rotation + 4) % 4;
    }

    if (newPosition >= 4) {
      newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation + cloverState.rotation) % 4;
    }

    setCloverState({
      ...cloverState,
      leaves: newLeaves.map((leaf) => {
        return {
          ...leaf,
          showIncorrect: false
        }
      })
    });
  }

  const getEntryValue = (index: number) => {
    return cloverState.entries[(index + cloverState.rotation) % 4];
  }

  const setEntryValue = (index: number, value: string) => {
    const entries = [...cloverState.entries];
    entries[(index + cloverState.rotation) % 4] = value;
    setCloverState({
      ...cloverState,
      entries: entries
    });
  }

  const getWordsPosition = (leafId: number, words: string[]) => {
    const leaf = cloverState.leaves.find(leaf => leaf.id === leafId);
    if (!leaf) {
      return [];
    }
    const rotation = (leaf.rotation + (leaf.position <= 3 ? cloverState.rotation : 0)) % 4;
    return words.map((_, index) => {
      return words[(index + rotation) % 4];
    });
  }

  const rotateLeaf = (id: number) => {
    return (direction: number) => {
      return () => {
        const newLeaves = [...cloverState.leaves];
        const leafIndex = cloverState.leaves.findIndex(leaf => leaf.id === id);
        newLeaves[leafIndex].rotation = (newLeaves[leafIndex].rotation + direction) % 4;
        setCloverState({
          ...cloverState,
          leaves: newLeaves.map((leaf) => {
            return {
              ...leaf,
              showIncorrect: false
            }
          })
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
    <div className={styles.buttonContainer}>
      <button onClick={(e) => {
        setShowIcon(true);
        setTimeout(() => {
          setShowIcon(false);
          setCloverState({
            ...cloverState,
            rotation: (cloverState.rotation + 3) % 4
          })
        }, 100);
      }}
      >Rotate Clover</button>{" "}
      {gameState === "CLUING" && <button onClick={() => {
        setGameState("GUESSING");
        const newCloverState = { ...cloverState };
        // randomize rotations and place into positions 4 through 8 inclusive. use each position exactly once.
        const positions = [4, 5, 6, 7, 8];
        newCloverState.leaves.forEach(leaf => {
          const newPosition = positions.splice(Math.floor(Math.random() * positions.length), 1)[0];
          leaf.position = newPosition;
          leaf.rotation = Math.floor(Math.random() * 4);
        });
      }}>
        Submit
      </button>}
      {gameState === "GUESSING" && <button onClick={
        () => {
          const newCloverState = JSON.parse(JSON.stringify(cloverState));
          const correctGuesses = cloverState.leaves.map((leaf, key) => {
            if (leaf.position >= 4) {
              // if not in the clover, don't grade it
              return undefined;
            }
            if (key === 4) {
              // this is the decoy. it is always wrong if it's in the first 4 positions.
              if (leaf.position <= 3) {
                return false;
              }
            } else {
              return key === leaf.position && leaf.rotation === 0;
            }
          });

          newCloverState.leaves.forEach((leaf: LeafState, key: number) => {
            leaf.showIncorrect = correctGuesses[key] === false;
          })

          setCloverState(newCloverState);

          // if thre aren't four correct guesses
          if (correctGuesses.filter(correct => correct).length < 4) {
            setTimeout(() => {
              const ejectedCloverState = JSON.parse(JSON.stringify(newCloverState));
              const takenSpots = newCloverState.leaves.map((leaf: LeafState) => leaf.position);
              const leafBankSpots = [4, 5, 6, 7, 8].filter(spot => !takenSpots.includes(spot));
              let ejectedCloverStateIndex = 0;
              console.log(ejectedCloverState)
              ejectedCloverState.leaves.forEach((leaf: LeafState) => {
                console.log(leaf.showIncorrect)
                if (leaf.showIncorrect) {
                  const newPosition = leafBankSpots[ejectedCloverStateIndex];
                  ejectedCloverStateIndex++;
                  leaf.position = newPosition;
                  console.log(newPosition);
                }
              });
              setCloverState(ejectedCloverState);
            }, 1000);
          } else {
            setGameState("REVEALED");
          }
        }}
      >Guess!</button>}
      {gameState === "REVEALED" &&
        <Celebrate />
      }
    </div>
    <div className={styles.centerContainer}>
      <div className={cx(styles.cloverContainer, {
        [styles.rotationAnimation]: showIcon,
      })}>
        <div></div>
        <div><TextInput
          tabIndex={1}
          canEdit={gameState === "CLUING"}
          value={getEntryValue(0)}
          setValue={(value) => {
            setEntryValue(0, value);
          }}
        /></div>
        <div></div>
        <div className={cx(styles.ccw, styles.verticalText)}><TextInput
          canEdit={gameState === "CLUING"}
          tabIndex={4}
          value={getEntryValue(3)}
          setValue={(value) => {
            setEntryValue(3, value);
          }}
        /></div>
        <div className={styles.centerContainer}>
          <div className={cx(styles.leavesContainer, {
            [styles.noModify]: gameState === "CLUING"
          })}>
            {[0, 1, 3, 2].map((i) => {
              const key = (i + cloverState.rotation) % 4;
              const childLeaf = cloverState.leaves.find(leaf => leaf.position === key);
              return <div className={styles.leafContainer} key={key}>
                <LeafPlaceholder id={"spot" + key} >
                  {
                    childLeaf ? <Leaf
                      onClick={rotateLeaf(childLeaf.id)}
                      words={getWordsPosition(childLeaf.id, childLeaf!.words)}
                      id={childLeaf.id}
                      showIncorrect={childLeaf.showIncorrect}
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
          canEdit={gameState === "CLUING"}
          tabIndex={2}
          value={getEntryValue(1)}
          setValue={(value) => {
            setEntryValue(1, value);
          }}
        /></div>
        <div></div>
        <div>
          <TextInput
            canEdit={gameState === "CLUING"}
            tabIndex={3}
            value={getEntryValue(2)}
            setValue={(value) => {
              setEntryValue(2, value);
            }}
          /></div>
        <div></div>
      </div>
      {gameState !== "CLUING" && <div className={styles.leafBank}>
        {[...Array(5)].map((_, key) => {
          const childLeaf = cloverState.leaves.find(leaf => leaf.position === key + 4);
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
      </div>}
    </div>
  </DndContext >
}