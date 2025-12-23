import React from "react";
import {TViewFilterModel} from "@/models/view";
import InputBase from "../../InputBase/InputBase";

export type TProps = {
  filter: TViewFilterModel,
  onChange: (value: string) => void,
}

export default function StringValue({filter, onChange}: TProps) {
  const onChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    onChange(ev.target.value);
  }, [onChange]);

  return (
    <InputBase
      type={"text"}
      value={typeof filter.value === "string" ? filter.value : ""}
      onChange={onChangeHandler}
    />
  );
}
