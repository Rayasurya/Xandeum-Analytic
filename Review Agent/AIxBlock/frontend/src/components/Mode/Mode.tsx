import { memo, useState } from "react";
import "./Mode.scss";

type TModeProps = {
  defaultValue?: string;
  onChange?: (val: string) => void;
};

const MemoizedMode = (props: TModeProps) => {
  const { defaultValue, onChange } = props;
  const [val, setValue] = useState<string | null>(defaultValue ?? "list");

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(value);
    onChange && onChange?.(value);
  };

  return (
    <div className="c-mode">
      <label
        className={`c-mode-group__button ${val === "list" ? "active" : ""}`}
      >
        <input
          className="c-mode-group__input"
          type="radio"
          value="list"
          onChange={(e) => handleToggle(e)}
          checked={val === "list"}
        />
        <span>List</span>
      </label>
      <label
        className={`c-mode-group__button ${val === "grid" ? "active" : ""}`}
      >
        <input
          className="c-mode-group__input"
          type="radio"
          value="grid"
          onChange={(e) => handleToggle(e)}
          checked={val === "grid"}
        />
        <span>Grid</span>
      </label>
    </div>
  );
};

export const Mode = memo(MemoizedMode);
