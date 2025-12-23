import React from "react";
import {TViewFilterModel} from "@/models/view";
import InputBase from "../../InputBase/InputBase";

export type TProps = {
  filter: TViewFilterModel,
  hasTime: boolean,
  onChange: (value: {min: string, max: string}) => void,
}

export default function DateRangeValue({filter, hasTime, onChange}: TProps) {
  const value = React.useMemo(() => {
    const v = {min: "", max: ""};

    if (filter.value) {
      if (typeof filter.value === "object" && Object.hasOwn(filter.value, "min") && typeof filter.value.min === "string") {
        v.min = filter.value.min;
      }

      if (typeof filter.value === "object" && Object.hasOwn(filter.value, "max") && typeof filter.value.max === "string") {
        v.max = filter.value.max;
      }
    }

    return v;
  }, [filter.value]);

  const onMinChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value.length === 16) {
      onChange({min: ev.target.value + ":00.0Z", max: value.max});
    }
  }, [onChange, value]);

  const onMaxChangeHandler = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value.length === 16) {
      onChange({min: value.min, max: ev.target.value + ":00.0Z"});
    }
  }, [onChange, value]);

  return (
    <>
      <InputBase
        type={hasTime ? "datetime-local" : "date"}
        value={value.min.length > 16 ? value.min.substring(0, 16) : ""}
        onChange={onMinChangeHandler}
      />
      <InputBase
        type={hasTime ? "datetime-local" : "date"}
        value={value.max.length > 16 ? value.max.substring(0, 16) : ""}
        onChange={onMaxChangeHandler}
      />
    </>
  );
}
