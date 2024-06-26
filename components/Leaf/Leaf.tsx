import React, { useState } from 'react';
import { PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import cx from "classnames";

import { CwIcon } from '@/icons/Rotate';
import { XIcon } from '@/icons/XIcon.tsx';

import styles from './Leaf.module.css'; // Import the CSS module

interface LeafProps {
  words: string[];
  id: number
  onClick: (direction: number) => () => void
  showIncorrect?: boolean
}

type Icon = 'ROTATE_CW' | 'ROTATE_CCW' | 'GRAB';

const Leaf: React.FC<LeafProps> = ({ words, id, onClick, showIncorrect }) => {
  const [icon, setIcon] = useState<Icon | undefined>();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const showIcon = (icon: Icon) => {
    setIcon(icon);
    setTimeout(() => {
      setIcon(undefined);
    }, 100);
  };

  return (
    <div
      className={cx(styles.leafContainer, {
        [styles.rotationAnimation]: icon === 'ROTATE_CW',
        [styles.rotationAnimationCcw]: icon === 'ROTATE_CCW',
        [styles.isDragging]: isDragging,
      })}
      ref={setNodeRef}
      style={style}
      onClick={() => {
        showIcon('ROTATE_CW');
        setTimeout(() => {
          onClick(3)();
        }, 100);
      }}
      onContextMenu={(e) => {
        showIcon('ROTATE_CCW');
        onClick(1)();
        e.preventDefault();
      }}
      {...listeners}
      {...attributes}
      tabIndex={-1}
    >
      <div className={styles.top}>{words[0]}</div>
      <div className={styles.right}>{words[1]}</div>
      <div className={styles.bottom}>{words[2]}</div>
      <div className={styles.left}>{words[3]}</div>
      <div className={styles.center}>
        <div className={styles.iconContainer}>
          <div className={cx({
            [styles.icon]: true,
            [styles.showIconCw]: icon === 'ROTATE_CW',
          })}>
            <CwIcon />
          </div>
          <div className={cx({
            [styles.cwIcon]: true,
            [styles.showIconCcw]: icon === 'ROTATE_CCW',
          })}>
            <CwIcon />
          </div>
          {showIncorrect &&
            <XIcon />
          }
        </div>
      </div>
    </div>
  );
};

export default Leaf;
