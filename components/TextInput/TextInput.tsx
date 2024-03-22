import styles from './TextInput.module.css';

export const TextInput = ({
  value, setValue
}: {
  value: string,
  setValue: (value: string) => void
}) => {
  return <input className={styles.textInput} type="text" value={value} onChange={(e) => {
    e.preventDefault();
    setValue(e.target.value);
  }} />;
}