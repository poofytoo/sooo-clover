import { gab } from '@/app/layout';
import styles from './TextInput.module.css';

import cx from "classnames";

export const TextInput = ({
  value,
  setValue,
  tabIndex,
  canEdit,
  placeholder
}: {
  value: string,
    setValue: (value: string) => void,
    tabIndex: number
    canEdit: boolean
    placeholder?: string
}) => {
  return <input
    className={cx(styles.textInput, gab.className)}
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