import { memo } from "react";
import { FormatsData } from "@/hooks/project/export/useGetExportData";

type TFormatDataExportProps = {
  availableFormats: FormatsData[];
  selected: string;
  onSelectType: (val: FormatsData) => void;
};

const MemoizedFormatDataExport = (props: TFormatDataExportProps) => {
  const { availableFormats, selected, onSelectType } = props;
  
  return (
    <div className="c-export-formats__list">
      <div className="c-export-formats__info">
        You can export dataset in one of the following formats:
      </div>
      {availableFormats?.map((item) => (
        <div
          key={`key-item-${item.title}`}
          className={`c-export-formats__item formats-item ${
            !item.disabled ? "active" : ""
          } ${item.name === selected ? "selected" : ""}`}
          onClick={() => onSelectType(item)}
        >
          <div className="c-export-formats__item-name">
            {item.title}
            {item?.tags && (
              <div className="c-export-formats__tags">
                {item.tags.map((tag) => (
                  <div key={`key-tag-${tag}`} className="c-export-formats__tag">
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          {item.description && (
            <div className="c-export-formats__description">
              {item.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const FormatDataExport = memo(MemoizedFormatDataExport);

export default FormatDataExport;
