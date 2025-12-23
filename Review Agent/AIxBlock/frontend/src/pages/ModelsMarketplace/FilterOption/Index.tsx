import { memo } from "react";
import "./Index.scss";

interface Opt {
  label: string;
  val: string;
}

type TFilterOptionProps = {
  label?: string;
  options: { field: string; val: string }[];
  onSelect?: (opt: Opt) => void;
};

const MemoizedFilterOption = (props: TFilterOptionProps) => {
  const { label, options, onSelect } = props;

  const handleSelectOpt = (opt: Opt) => {
    onSelect && onSelect(opt);
  };

  return (
    <div className="c-filter-opt">
      {label && <label>{label}</label>}
      {options ? (
        <div className="c-filter-opt__content">
          {(options ?? []).map((opt, index) => (
            <div
              key={`key-opt-${index}`}
              className="c-filter-opt__item"
              onClick={() =>
                handleSelectOpt({ label: label ?? "", val: opt.val })
              }
            >
              {opt.field}
            </div>
          ))}
        </div>
      ) : null}

      
    </div>
  );
};

const FilterOption = memo(MemoizedFilterOption);

export default FilterOption;
