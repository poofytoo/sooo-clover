
import cx from "classnames";

import { gab } from '@/utils';

import styles from './TextInput.module.css';

export const TextInput = ({
  value,
  setValue,
  tabIndex,
  canEdit,
  placeholder,
  isVertical
}: {
  value: string,
    setValue: (value: string) => void,
    tabIndex: number
    canEdit: boolean
    placeholder?: string
    isVertical?: boolean
}) => {
  return <input
    className={cx(styles.textInput, gab.className, {
      [styles.isVertical]: isVertical
    })}
    type="text"
    value={value}
    tabIndex={tabIndex}
    disabled={!canEdit}
    placeholder={placeholder ?? "clue"}
    onChange={(e) => {
      if (!canEdit) return;
      e.preventDefault();
      setValue(e.target.value);
    }} />;
}