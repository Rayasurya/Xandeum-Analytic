import React from "react";
import {TViewFilterModel} from "@/models/view";
import InputBase from "../../InputBase/InputBase";

export type TProps = {
  filter: TViewFilterModel,
  onChange: (value: {min: number, max: number}) => void,
}

export default function NumberRangeValue({filter, onChange}: TProps) {
  const value = React.useMemo(() => {
    const v: {min: number, max: number} = {min: 0, max: 0};

    if (filter.value) {
      if (typeof filter.value === "object" && Object.hasOwn(filter.value, "min") && typeof filter.value.min === "number") {
        v.min = filter.value.min;
      }

      if (typeof filter.value === "object" && Object.hasOwn(filter.value, "max") && typeof filter.value.max === "number") {
        v.max = filter.value.max;
      }
    }

    return v;
  }, [filter.value]);

  const onMinChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value.length > 0) {
      onChange({min: parseInt(ev.target.value) ?? 0, max: value.max});
    } else {
      onChange({min: 0, max: value.max});
    }
  }, [onChange, value]);

  const onMaxChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value.length > 0) {
      onChange({min: value.min, max: parseInt(ev.target.value) ?? 0});
    } else {
      onChange({min: value.min, max: 0});
    }
  }, [onChange, value]);

  return (
    <>
      <InputBase
        type={"number"}
        value={value.min ? value.min.toString() : "0"}
        onChange={onMinChangeHandler}
      />
      <InputBase
        type={"number"}
        value={value.max ? value.max.toString() : "0"}
        onChange={onMaxChangeHandler}
      />
    </>
  );
}
