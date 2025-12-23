// import { addDays } from "date-fns";
// import { enUS } from "date-fns/locale";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  memo,
  // useState,
} from "react";
// import { DateRangePicker } from "react-date-range";
// import IconClock from "@/assets/icons/IconClock";
// import IconClose from "@/assets/icons/IconClose";
// import IconFilter from "@/assets/icons/IconFilter";
// import IconTypeSolid from "@/assets/icons/IconTypeSolid";
// import Button from "@/components/Button/Button";
// import InputBase from "@/components/InputBase/InputBase";
// import Select, { DataSelect, SelectOption } from "@/components/Select/Select";
// import { compute_types } from "@/constants/computeType";
// import { debounce } from "@/utils/debounce";
import "./FilterBox.scss";
// import { formatDate } from "@/utils/formatDate";
import { TpropsCompute } from "@/hooks/admin/compute/useCompute";

type TFilterBoxProps = {
  headerText?: ReactNode;
  onChange?: (field: string, val: string | number) => void;
  filterParams: TpropsCompute | null;
  searchParams: URLSearchParams;
  setFilterParams: Dispatch<SetStateAction<TpropsCompute | null>>;
  onClearFilter: () => void;
  setSearchParams: (param: URLSearchParams) => void;
};

/* Temporary hide */
/*const LOCATION: DataSelect[] = [{
  options: [
    { label: "Any", value: "any" },
    { label: "CA-MTL-1", value: "ca-mtl-1" },
    { label: "EU-NL-1", value: "eu-nl-1" },
    { label: "EU-RO-1", value: "eu-ro-1" },
    { label: "EU-SE-1", value: "eu-se-1" },
    { label: "EUR-IS-1", value: "eur-is-1" },
    { label: "EUR-IS-2", value: "eur-is-2" },
    { label: "EUR-NO-1", value: "eur-no-1" },
    { label: "US-OR-1", value: "us-or-1" },
  ]
}];*/

const MemoizedFilterBox: React.FC<TFilterBoxProps> = ({
  headerText,
  /* Temporary hide */
  /*onChange,
  filterParams,
  setFilterParams,
  onClearFilter,
  searchParams,
  setSearchParams,*/
}) => {
  /* Temporary hide */
  /*const [expand, setExpand] = React.useState(false);

  const [isOpenDateRange, setOpenDataRange] = useState<boolean>(false);

  const [selectionRange, setSelectionRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 3), // Todo: wait for another logic
      key: "selection",
      color: "#F4F5F9",
    },
  ]);

  const dataComputeTypes = React.useMemo((): DataSelect[] => {
    return [
      {
        label: "Select type",
        options: compute_types.options,
      },
    ];
  }, []);

  const handleFilterOptionChange = (field: string, val: string | number) => {
    onChange?.(field, val);
  };

  const handleSetdate = () => {
    const startDate = formatDate(selectionRange[0].startDate, "YYYY-MM-DD");
    const endDate = formatDate(selectionRange[0].endDate, "YYYY-MM-DD");
    const params = {
      ...filterParams,
      startDate: startDate,
      endDate: endDate,
    };
    params && setFilterParams(params);
    searchParams.set("startDate", startDate);
    searchParams.set("endDate", endDate);
    setSearchParams(searchParams);
    setOpenDataRange(false);
  };*/

  return (
    <div className="c-filter-opt">
      <div className="c-filter-opt__row">
        {headerText}
        {/* Temporary hide */}
        {/*<div className="c-filter-opt__action">
          {filterParams && (
            <button
              className="p-ml-marketplace__clear"
              onClick={() => onClearFilter()}
            >
              <IconClose />
            </button>
          )}
          <div className="c-filter-opt__type">
            <IconTypeSolid />
            <Select
              data={dataComputeTypes}
              defaultValue={
                filterParams?.type
                  ? { label: filterParams?.type, value: filterParams?.type }
                  : { label: "Type", value: "" }
              }
              onChange={(val) => handleFilterOptionChange("type", val.value)}
            />
          </div>
          <button
            className={`c-filter-opt__expand-button ${expand && "active"}`}
            onClick={() => {
              setExpand((expand) => !expand);
            }}
          >
            <IconFilter {...(expand && { color: "#5050FF" })} />
          </button>
        </div>*/}
      </div>
      {/* Temporary hide */}
      {/*<div className={`c-filter-opt__row ${!expand && "hide"}`}>
        <div></div>
        <div className="c-filter-opt__action flex-end">
          <InputBase
            className="c-filter-opt__input h-32"
            autoFocus={true}
            label="Price min"
            allowClear={false}
            onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
              handleFilterOptionChange("min_price", e.target.value);
            }, 1000)}
            customRightItem={
              <span className="c-filter-opt__input__symbol">$</span>
            }
            type="number"
            value={filterParams?.min_price ?? ""}
          />
          <InputBase
            className="c-filter-opt__input h-32"
            autoFocus={true}
            label="Price max"
            allowClear={false}
            onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
              handleFilterOptionChange("max_price", e.target.value);
            }, 1000)}
            customRightItem={
              <span className="c-filter-opt__input__symbol">$</span>
            }
            type="number"
            value={filterParams?.max_price ?? ""}
          />
          <div className="c-input-base__field">
            <label className="c-input-base__label">
              <span>Freetime</span>
            </label>
            <div className="freetime">
              <IconClock />
              <Button
                className="btn-freetime h-32"
                onClick={() => setOpenDataRange(true)}
              >
                {filterParams &&
                  (filterParams?.startDate ?? "") + " - " + (filterParams?.endDate ?? "")}
              </Button>
              {isOpenDateRange && (
                <div className="date-range-content">
                  <DateRangePicker
                    locale={enUS}
                    onChange={(item) =>
                      setSelectionRange([item.selection] as any)
                    }
                    moveRangeOnFirstSelection={false}
                    months={2}
                    ranges={selectionRange}
                    direction="horizontal"
                    onPreviewChange={() => {}}
                  />
                  <div className="date-range-content__action flex">
                    <div className="date-range-content__action-left flex">
                      <InputBase
                        value={selectionRange[0].startDate.toLocaleDateString()}
                        allowClear={false}
                        className="date-range-content__input"
                      />
                      <span className="to">to</span>
                      <InputBase
                        value={selectionRange[0].endDate.toLocaleDateString()}
                        allowClear={false}
                        className="date-range-content__input"
                      />
                    </div>
                    <div className="date-range-content__action-right flex">
                      <Button
                        className="date-range-content__button cancel"
                        onClick={() => setOpenDataRange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="date-range-content__button setdate"
                        onClick={() => handleSetdate()}
                      >
                        SetDate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="c-filter-opt__location">
            <Select
              data={LOCATION}
              defaultValue={LOCATION[0].options.find(o => o.value === (filterParams?.location ?? "any"))}
              iconWithLabel={<img src={require("@/assets/images/earth_icon.png")} alt="earch icon"/>}
              isCreatePortal={false}
              onChange={debounce((e: SelectOption) => handleFilterOptionChange("location", e.value), 1000)}
            />
          </div>
        </div>
      </div>*/}
    </div>
  );
};

const FilterBox = memo(MemoizedFilterBox);

export default FilterBox;
