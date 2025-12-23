import React, {useMemo} from "react";
import {TColumnModel, TColumnSchemaItemsModel} from "@/models/column";
import {TViewFilterModel} from "@/models/view";
import "./index.scss";
import {columnKey} from "@/utils/column";
import getOperators, {getDefaultOperator} from "./operators";
import BooleanValue from "./Values/BooleanValue";
import DateValue from "./Values/DateValue";
import DateRangeValue from "./Values/DateRangeValue";
import NumberRangeValue from "./Values/NumberRangeValue";
import NumberValue from "./Values/NumberValue";
import StringValue from "./Values/StringValue";
import ListValue from "./Values/ListValue";
import getDefaultValue from "./defaultValues";
import Select, { DataSelect, SelectOption } from "../Select/Select";
import IconThinArrowDown from "@/assets/icons/IconThinArrowDown";
import Button from "../Button/Button";
import IconTrash from "@/assets/icons/IconTrash";
import IconPlus from "@/assets/icons/IconPlus";
import {IconSave} from "@/assets/icons/Index";

export type TProps = {
  columns: TColumnModel[],
  filters: TViewFilterModel[],
  onAdd?: () => void,
  onApply?: () => void,
  onRemove?: (index: number) => void,
  onUpdate?: (index: number, filter: TViewFilterModel) => void,
}

export default function Filters({columns, filters, onAdd, onApply, onRemove, onUpdate}: TProps) {
  const columnKeys = React.useMemo(() => {
    return columns
      .filter(c => !Object.hasOwn(c, "children"))
      .map(c => ["filter:" + columnKey(c), c.title, c.type]);
  }, [columns]);

  const listValues = React.useMemo(() => {
    const result: { [k: string]: TColumnSchemaItemsModel} = {};

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].type !== "List" || !(typeof columns[i].schema?.items === "object") || !columns[i].schema?.items.length) {
        continue;
      }

      // @ts-ignore
      result["filter:" + columnKey(columns[i])] = columns[i].schema.items;
    }

    return result;
  }, [columns]);

  const columnsSelectList = useMemo(() => {
    return {
      options: [
        ...columnKeys.map((item) => ({
          label: item[1],
          value: item[0],
        })),
      ],
    }
  }, [columnKeys]);

  const renderFilter = React.useCallback(
    (key: string, filter: TViewFilterModel, removeFilter: () => void, updateFilter: (filter: TViewFilterModel) => void) => {
      const operators = getOperators(filter.type);
      const operatorKeys = Object.keys(operators);
      const filterType = filter.operator === "empty" ? "boolean" : filter.type.toLowerCase();
      let filterValue;

      switch (filterType) {
        case "date":
        case "datetime":
          if (filter.operator === "in" || filter.operator === "not_in") {
            filterValue = (
              <DateRangeValue filter={filter} hasTime={filterType === "datetime"} onChange={value => {
                filter.value = value;
                updateFilter(filter);
              }}/>
            );
          } else {
            filterValue = (
              <DateValue filter={filter} hasTime={filterType === "datetime"} onChange={value => {
                filter.value = value;
                updateFilter(filter);
              }}/>
            );
          }
          break;

        case "number":
        case "duration":
          if (filter.operator === "in" || filter.operator === "not_in") {
            filterValue = (
              <NumberRangeValue filter={filter} onChange={value => {
                filter.value = value;
                updateFilter(filter);
              }}/>
            );
          } else {
            filterValue = (
              <NumberValue filter={filter} onChange={value => {
                filter.value = value;
                updateFilter(filter);
              }}/>
            );
          }
          break;

        case "audio":
        case "string":
          filterValue = (
            <StringValue filter={filter} onChange={(value: string) => {
              filter.value = value;
              updateFilter(filter);
            }} />
          );
          break;

        case "list":
          filterValue = (
            <div className="c-filters__select">
              <ListValue filter={filter} values={listValues[filter.filter] ?? []} onChange={(value: string) => {
                filter.value = value;
                updateFilter(filter);
              }} />
            </div>
          );
          break;

        case "boolean":
        default:
          filterValue = (
            <div className="c-filters__select">
              <BooleanValue filter={filter} onChange={(value: string) => {
                filter.value = value;
                updateFilter(filter);
              }} />
            </div>
          );
      }

      const convertDataOperator = (): DataSelect[] =>
        operatorKeys.map((item) => ({
          options: [{ label: operators[item], value: item }],
        }));

      const selectedColumnValue: SelectOption | undefined = columnsSelectList.options.find(
        (c) => c.value === filter.filter
      );

      const defaultValueOperator: SelectOption =
        convertDataOperator().find((c) => c.options[0].value === filter.operator)
          ?.options[0] ?? convertDataOperator()[0].options[0];

      return (
        <div key={key} className="c-filters__item">
          <div className="c-filters__select">
            <Select
              className="c-filters__item__list"
              data={[columnsSelectList]}
              onChange={(val) => {
                const col = columnKeys.find((ck) => ck[0] === val.value);
                const colunm = columns.find(c => c.type === filter.type);

                filter.filter = val.value;
                filter.type = col ? col[2] : "fallback";
                filter.operator = getDefaultOperator(filter.type);

                if (
                  filter.type.toLowerCase() === "list"
                  && colunm?.schema?.items
                  && colunm.schema.items.length > 0
                  && typeof colunm.schema.items[0] === "object"
                ) {
                  filter.value = colunm.schema.items[0].value;
                } else {
                  filter.value = getDefaultValue(filter.type, filter.operator);
                }

                updateFilter(filter);
              }}
              isCreatePortal={false}
              iconWithLabel={<IconThinArrowDown />}
              defaultValue={selectedColumnValue}
            />
          </div>
          <div className="c-filters__select">
            <Select
              className="c-filters__item__list"
              data={convertDataOperator()}
              onChange={(val) => {
                filter.operator = val.value;
                filter.value = getDefaultValue(filter.type, val.value);
                updateFilter(filter);
              }}
              isCreatePortal={false}
              iconWithLabel={<IconThinArrowDown />}
              defaultValue={defaultValueOperator}
            />
          </div>
          {filterValue}
          <button className="btn-remove" onClick={() => removeFilter()}>
            <IconTrash />
          </button>
        </div>
      );
    }, [columnKeys, columns, columnsSelectList, listValues]
  );

  const filterElements  = React.useMemo(() => filters.map((f, idx) => {
    return renderFilter(
      "filter-" + idx,
      f,
      () => {
        onRemove?.(idx);
      },
      (filter) => {
        onUpdate?.(idx, filter);
      },
    );
  }) , [filters, onRemove, onUpdate, renderFilter]);

  return (
    <div className="c-filters">
      {filters.length === 0 && (
        <div className="c-filters__empty">
          No filter defined. Click <strong>Add filter</strong> to start filtering.
        </div>
      )}
      {filterElements}
      <div className="group-btn">
        <Button
          children={<IconPlus />}
          icon={'Add filter'}
          type="primary"
          onClick={() => onAdd?.()}
        />
        <Button
          children={<IconSave />}
          icon={'Apply'}
          type="gradient"
          onClick={() => onApply?.()}
        />
      </div>
    </div>
  );
}
