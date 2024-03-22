import styles from './TextInput.module.css';

export const TextInput = ({
  value,
  setValue,
  tabIndex,
  canEdit
}: {
  value: string,
    setValue: (value: string) => void,
    tabIndex: number
    canEdit: boolean
}) => {
  return <input
    className={styles.textInput}
    type="text"
    value={value}
    tabIndex={tabIndex}
    disabled={!canEdit}
    onChange={(e) => {
      if (!canEdit) return;
      e.preventDefault();
      setValue(e.target.value);
    }} />;
}