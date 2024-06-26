'use client';

import { useCallback, useEffect, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import cx from "classnames";

import { Attempts } from '@/components/Attempts';
import { Celebrate } from '@/components/Celebrate';
import { LeafPlaceholder } from '@/components/LeafPlaceholder';
import { CwIcon } from '@/icons/Rotate';
import { GameState } from '@/types';
import { CloverState, LeafState } from '@/types';
import { encodeJsonObject } from '@/utils';

import { Button } from '../Button';
import Leaf from '../Leaf/Leaf';
import { TextInput } from '../TextInput';

import styles from './Clover.module.css'

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

  const submitClues = useCallback(async () => {

    const newCloverState = { ...cloverState };
    // randomize rotations and place into positions 4 through 8 inclusive. use each position exactly once.
    const positions = [4, 5, 6, 7, 8];
    newCloverState.leaves.forEach(leaf => {
      const newPosition = positions.splice(Math.floor(Math.random() * positions.length), 1)[0];
      leaf.position = newPosition;
      leaf.rotation = Math.floor(Math.random() * 4);
    });

    // push to firebase
    const result = await fetch('/api/game', {
      method: 'POST',
      body: JSON.stringify(newCloverState),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (result.status === 200) {
      console.log(result);
      const data = await result.json();
      const gameId = data.gameId;
      setGameState("GUESSING");

      // set the url to be the current game state
      const url = new URL(window.location.href);
      url.searchParams.set('game', gameId);
      window.history.pushState({}, '', url.toString());
    } else {
      alert("Failed to submit clues. Please try again.");
    }
  }, [cloverState, setGameState]);

  useEffect(() => {
    // detect enter key, and submit clues
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        // check that all clues are filled out
        if (gameState === "CLUING" && cloverState.entries.filter(entry => entry.length === 0).length === 0) {
          submitClues();
        }
      }
      // check if ctrl + s is pressed. if so, set the clover state to: leaves 0 through 3 are in the correct position (positions 0 through 3), and 4 is in the leaf bank (position 4). also set the rotation to 0 for all leaves.
      if (event.ctrlKey && event.key === "s") {
        setCloverState({
          ...cloverState,
          leaves: cloverState.leaves.map((leaf, key) => {
            return {
              ...leaf,
              position: key,
              rotation: 0
            }
          })
        });
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [gameState, submitClues, cloverState]);

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
      entries
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
      {gameState === "REVEALED"
        && <>{(cloverState.attemptState !== "RESIGNED"
          && cloverState.attemptState !== "LOSE") ? <h2>
          {cloverState.congratulationsMessage}
        </h2> : <h3>Next Time!</h3>}
        </>}
      {gameState !== "REVEALED" &&
        <Button
          onClick={() => {
            setShowIcon(true);
            setTimeout(() => {
              // wipe leaf.showIncorrect = false;
              const newCloverState = { ...cloverState };
              newCloverState.leaves = newCloverState.leaves.map((leaf) => {
                return {
                  ...leaf,
                  showIncorrect: false
                }
              });
              setShowIcon(false);
              setCloverState({
                ...newCloverState,
                rotation: (cloverState.rotation + 3) % 4
              })
            }, 100);
          }}
        >Rotate Grid</Button>}{" "}
      {gameState === "REVEALED" &&
        <>
        {cloverState.attemptState !== "LOSE" &&
          cloverState.attemptState !== "RESIGNED" && <Celebrate />}
        <Button
          isSecondary={true}
          onClick={() => {
            setGameState("GUESSING");
            setCloverState({
              ...cloverState,
              attempts: 0,
              attemptState: "ATTEMPTING",
              leaves: cloverState.leaves.map((leaf, key) => {
                return {
                  ...leaf,
                  position: key + 4,
                  rotation: 0
                }
              })
            })
          }}>Replay Clover</Button>{" "}
        <Button onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('game');
          window.history.pushState({}, '', url.toString());
          setGameState("SELECTING_GAME");
          // clear URL
        }}>New Game</Button>
      </>
      }
    </div>
    {
      (gameState === "GUESSING" || gameState === "REVEALED") && <div>
        <Attempts numberOfTries={cloverState.attempts} />
      </div>
    }
    <div className={styles.centerContainer}>
      <div className={cx(styles.cloverContainer, {
        [styles.rotationAnimation]: showIcon,
      })}>
        <div />
        <div>
          <TextInput
            tabIndex={1}
            canEdit={gameState === "CLUING"}
            value={getEntryValue(0)}
            setValue={(value) => {
              setEntryValue(0, value);
            }}
          />
        </div>
        <div />
        <div className={styles.verticalTextContainer}>
          <div className={cx(styles.ccw, styles.verticalText)}>
            <TextInput
              canEdit={gameState === "CLUING"}
              tabIndex={4}
              isVertical={true}
              value={getEntryValue(3)}
              setValue={(value) => {
                setEntryValue(3, value);
              }}
            />
          </div>
        </div>
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
        <div className={styles.verticalTextContainer}>
          <div className={cx(styles.cw, styles.verticalText)}>
            <TextInput
              canEdit={gameState === "CLUING"}
              tabIndex={2}
              value={getEntryValue(1)}
              setValue={(value) => {
                setEntryValue(1, value);
              }}
              isVertical={true}
            />
          </div>
        </div>
        <div></div>
        <div className={styles.bottomTextInput}>
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
      {gameState === "GUESSING" && <div className={styles.bottomButtonContainer}>
        <Button
          isSecondary={true}
          onClick={() => {
            const confirm = window.confirm("You Sure?");
            if (!confirm) {
              return;
            }
            setCloverState({
              ...cloverState,
              attemptState: "RESIGNED",
              leaves: cloverState.leaves.map((leaf, key) => {
                return {
                  ...leaf,
                  position: key,
                  rotation: 0
                }
              })
            });
            setGameState("REVEALED")
          }}>
          Give Up & Quit
        </Button>{" "}
        <Button
          disabled={cloverState.leaves.filter(leaf => leaf.position < 4).length < 4}
          onClick={
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
                  ejectedCloverState.leaves.forEach((leaf: LeafState) => {
                    if (leaf.showIncorrect) {
                      const newPosition = leafBankSpots[ejectedCloverStateIndex];
                      ejectedCloverStateIndex++;
                      // leaf.position = newPosition;
                      // leaf.showIncorrect = false;
                    }
                  });
                  // increment attempts
                  ejectedCloverState.attempts++;
                  setCloverState(ejectedCloverState);
                }, 500);
              } else {
                setGameState("REVEALED");
              }
            }}
        >
          Guess!
        </Button>
      </div>
      }
      {gameState === "CLUING" && <div className={styles.bottomButtonContainer}>
        <Button
          isSecondary={true}
          onClick={() => {
            const confirm = window.confirm("You Sure?");
            if (!confirm) {
              return;
            }
            setGameState("SELECTING_GAME");
            const url = new URL(window.location.href);
            url.searchParams.delete('game');
            window.history.pushState({}, '', url.toString());
          }}>
          New Game
        </Button>{" "}
        <Button onClick={submitClues}
          disabled={
            cloverState.entries.filter(entry => entry.length === 0).length > 0
          }
          tabIndex={5}>
          Submit
        </Button>
      </div>
      }
    </div>
  </DndContext >
}