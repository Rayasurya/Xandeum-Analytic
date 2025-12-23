import Select from "../Select/Select";
import React from "react";

export type Option = {
  label: string;
  value: number;
};

export type TProps = {
  framework: number | undefined;
  frameworks: Option[];
  onChange?: (framework: number) => void;
  label?: string;
  isProcessing?: boolean;
  isRequired?: boolean;
};

export default function MLNetwork({
  framework,
  frameworks,
  onChange,
  label,
  isProcessing,
  isRequired,
}: TProps) {
  // Chuyển đổi các option sang dạng mà Select mong đợi (value dạng string)
  const selectOptions = React.useMemo(() => {
    return frameworks.map(option => ({
      label: option.label,
      value: option.value.toString(),
    }));
  }, [frameworks]);

  // Xác định option được chọn: nếu framework không xác định, chọn New Network (value "0")
  const selectedOption = React.useMemo(() => {
    const value = framework !== undefined ? framework.toString() : "0";
    return selectOptions.find(o => o.value === value);
  }, [framework, selectOptions]);

  return (
    <Select
      label={label ?? "ML Network"}
      placeholderText="Select ML Network"
      disabled={isProcessing}
      isRequired={isRequired}
      data={[{ options: selectOptions }]}
      defaultValue={selectedOption}
      onChange={o => {
        // Chuyển đổi giá trị từ string sang number
        onChange?.(parseInt(o.value, 10));
      }}
    />
  );
}
