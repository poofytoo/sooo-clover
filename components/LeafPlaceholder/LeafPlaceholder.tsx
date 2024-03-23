import { useDroppable } from '@dnd-kit/core';
import cx from "classnames";

import styles from './LeafPlaceholder.module.css';

export const LeafPlaceholder = ({ id, children }: {
  id: string
  children?: any
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id
  });

  return <div className={cx(styles.leafPlaceholder, {
    [styles.noLeaf]: children === null || active?.id === children?.props?.id,
    [styles.isOver]: isOver,
    [styles.isActive]: active?.id === children?.props?.id
  })} ref={setNodeRef}>
    {children}
  </div>
}