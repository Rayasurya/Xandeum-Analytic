import React from "react";
import {TViewFilterModel} from "@/models/view";
import Select, { DataSelect, SelectOption } from "../../Select/Select";
import IconThinArrowDown from "@/assets/icons/IconThinArrowDown";

export type TProps = {
  filter: TViewFilterModel,
  onChange: (value: string) => void,
}

export default function BooleanValue({filter, onChange}: TProps) {
  const onChangeHandler = React.useCallback((ev: SelectOption) => {
    onChange(ev.value === "1" ? "1" : "0");
  }, [onChange]);

  const dataBooleanValue: DataSelect[] = [
    {
      options: [
        { label: "No", value: "0" },
        { label: "Yes", value: "1" },
      ],
    },
  ];

  const defaultValue = filter.value === "1"
    ? { label: "Yes", value: "1" }
    : { label: "No", value: "0" };

  return (
    <Select
      className="c-filters__item__list"
      data={dataBooleanValue}
      onChange={onChangeHandler}
      defaultValue={defaultValue}
      iconWithLabel={<IconThinArrowDown />}
      isCreatePortal={false}
    />
  );
}
