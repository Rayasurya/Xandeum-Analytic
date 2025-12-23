import { useState } from "react";
import "./Index.scss";

interface Percent {
  label: string;
  count: number;
  type?: "danger" | "success";
}

interface IPercentProps {
  data: Percent[];
}

// Todo: Can be update another UI
const Percents = (props: IPercentProps) => {
  const [paramsValue, setParamsValue] = useState<number | undefined>(undefined);

  const handleParamsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParamsValue(parseInt(event.target.value));
  };

  return (
    <div className="c-percents">
      {props.data.map((item) => (
        <div
          className={`c-percents__item ${item.type ? item.type : "default"}`}
          key={`key-${item.count}`}
        >
          {item.label && <span>{item.label}</span>}
          <div>
            {item.label === "Params:" ? (
              <input
                type="number"
                value={paramsValue !== undefined ? paramsValue : ""}
                onChange={handleParamsChange}
              />
            ) : (
              item.count && <span>{item.count}</span>
            )}
            <span>%s</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Percents;
