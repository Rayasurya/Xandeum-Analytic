import React from "react";
import {TViewFilterModel} from "@/models/view";
import {TColumnSchemaItemsModel} from "@/models/column";
import Select, { DataSelect, SelectOption } from "../../Select/Select";
import IconThinArrowDown from "@/assets/icons/IconThinArrowDown";

export type TProps = {
  filter: TViewFilterModel,
  onChange: (value: string) => void,
  values: TColumnSchemaItemsModel,
}

export default function ListValue({filter, onChange, values}: TProps) {
  const onChangeHandler = React.useCallback((ev: SelectOption) => {
    onChange(ev.value);
  }, [onChange]);

  const valuesList: SelectOption[] = [
    {label: "", value: "-1"},
    ...values.map(v => {
      if (typeof v === "string" || typeof v === "number") {
        return {
          label: String(v),
          value: String(v),
        };
      }

      return { label: String(v.title), value: String(v.value) };
    }),
  ];

  const dataValuesList: DataSelect[] = [{ options: valuesList }]

  const defaultValue = typeof filter.value === "string" && filter.value
    ? (valuesList.find(v => v.value === filter.value) ?? valuesList[0])
    : valuesList[0]

    return (
    <Select
      className="c-filters__item__list"
      data={dataValuesList}
      onChange={onChangeHandler}
      defaultValue={defaultValue}
      iconWithLabel={<IconThinArrowDown />}
      isCreatePortal={false}
    />
  );
}
