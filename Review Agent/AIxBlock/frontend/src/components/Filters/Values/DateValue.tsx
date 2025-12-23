import React from "react";
import {TViewFilterModel} from "@/models/view";
import InputBase from "../../InputBase/InputBase";

export type TProps = {
  filter: TViewFilterModel,
  hasTime: boolean,
  onChange: (value: string) => void,
}

export default function DateValue({filter, hasTime, onChange}: TProps) {
  const onChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value.length === 16) {
      onChange(ev.target.value + ":00.0Z");
    }
  }, [onChange]);

  return (
    <InputBase
      type={hasTime ? "datetime-local" : "date"}
      value={typeof filter.value === "string" ? filter.value.substring(0, 16) : ""}
      onChange={onChangeHandler}
    />
  );
}
