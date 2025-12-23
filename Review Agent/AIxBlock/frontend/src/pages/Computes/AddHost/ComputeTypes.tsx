import React from "react";
import styles from "./ComputeTypes.module.scss";

export type TComputeType = {
  label: string;
  activeChecker?: () => boolean;
  onClick?: () => void;
}

export type TProps = {
  types: TComputeType[],
}

export default function ComputeTypes({types}: TProps) {
  return (
    <div className={styles.types}>
      {types.map((type, index) => (
        <span
          key={"step-" + index}
          className={[
            ...(type.activeChecker?.() ? [styles.typeItem, styles.typeItemActive] : [styles.typeItem]),
            ...(type.onClick ? [styles.typeItemClickable] : []),
          ].join(" ")}
          onClick={type.onClick}
        >
          <div className={styles.cricle}></div>
          {type.label}
        </span>
      ))}
    </div>
  );
}
