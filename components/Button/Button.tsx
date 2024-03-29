import cx from "classnames"

import { gab } from "@/utils"

import styles from "./Button.module.css"

export const Button = (props: any) => {
  const { isSecondary } = props
  const buttonProps = { ...props }
  delete buttonProps.isSecondary
  return <button
    className={cx(styles.button, gab.className, {
      [styles.isSecondary]: isSecondary,
    })}
    {...buttonProps}
  />
}