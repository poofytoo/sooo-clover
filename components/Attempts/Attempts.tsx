import React from 'react';

import styles from './Attempts.module.css'; // Import CSS module

interface TriesProps {
  numberOfTries: number; // Prop to receive the number of tries (0 to 2)
}

export const Attempts: React.FC<TriesProps> = ({ numberOfTries }) => {
  return (
    <div className={styles.container}>
      {[0, 1, 2].map((index) => (
        <div className={styles.circle} key={index}>
          {index < numberOfTries && <span className={styles.cross}>×</span>}
        </div>
      ))}
    </div>
  );
};
