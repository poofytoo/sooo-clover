import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const Celebrate: React.FC = () => {
  const { width, height } = useWindowSize();

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={50}
      recycle={true}
      drawShape={ctx => {
        ctx.beginPath();
        ctx.rect(0, 0, 15, 15);
        ctx.fillStyle = '#548f10'; // A shade of green, adjust as needed
        ctx.fill();
      }}
    />
  );
};
