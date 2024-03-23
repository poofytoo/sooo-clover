import cx from "classnames"

import { gab } from "@/utils"

import styles from "./Button.module.css"

export const Button = (props: any) => {
  return <button className={cx(styles.button, gab.className)} {...props} />
}