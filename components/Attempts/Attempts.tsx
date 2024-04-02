import React from 'react';

import styles from './Attempts.module.css'; // Import CSS module

interface TriesProps {
  numberOfTries: number; // Prop to receive the number of tries (0 to 2)
}

export const Attempts: React.FC<TriesProps> = ({ numberOfTries }) => {
  return (
    <div className={styles.attemptsContainer}>
      <div className={styles.instructions}>
        <strong>Drag squares</strong> into the grid such that the sides of the squares "match" the nearest label on the edge of the grid. The words in the middle of the grid are not used. <strong>Click on a square to rotate</strong>.
      </div>
      <div className={styles.pipsContainer}>
        {[0, 1, 2].map((index) => (
          <div className={styles.circle} key={index}>
            {index < numberOfTries && <span className={styles.cross}>×</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
