import React from "react";
import "./TabSelect.scss";

export type TTabSelect = {
  tabs: {[k: string]: string},
  value?: string | null,
  onChange?: (v: string | null) => void,
  noPadding?: boolean,
  isPrimaryColor?: boolean,
}

export default function TabSelect({tabs, value, onChange, noPadding, isPrimaryColor}: TTabSelect) {
  const className = React.useMemo(() => {
    const classes = ["c-tab-select"];

    if (noPadding) {
      classes.push("c-tab-select--no-padding");
    }

    if (isPrimaryColor) {
      classes.push("c-tab-select--primary-color");
    }

    return classes.join(" ")
  }, [isPrimaryColor, noPadding]);

  return (
    <div className={className}>
      {
        Object.keys(tabs).map((tk, i) => {
          const classes = ["c-tab-select__item"];

          if (tk === value) {
            classes.push("c-tab-select__item--selected");
          }

          return (
            <div
              key={"tab-" + i}
              className={classes.join(" ")}
              onClick={() => onChange?.(tk === value ? null : tk)}>
              {tabs[tk]}
            </div>
          );
        })
      }
    </div>
  );
}
