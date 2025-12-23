import React from "react";
import {TViewFilterModel} from "@/models/view";
import InputBase from "../../InputBase/InputBase";

export type TProps = {
  filter: TViewFilterModel,
  onChange: (value: number) => void,
}

export default function NumberValue({filter, onChange}: TProps) {
  const onChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(ev.target.value) ?? 0);
  }, [onChange]);

  return (
    <InputBase
      type={"number"}
      value={String(typeof filter.value === "number" ? filter.value : 0)}
      onChange={onChangeHandler}
    />
  );
}
