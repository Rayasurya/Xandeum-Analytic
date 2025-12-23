import Select from "../Select/Select";
import React from "react";

export type TFramework = "tensorflow" | "pytorch" | "huggingface";

export type TProps = {
  framework: TFramework | undefined;
  onChange?: (framework: TFramework) => void;
  label?: string;
  isProcessing?: boolean;
  isRequired?: boolean;
}

export default function Framework({framework, onChange, label, isProcessing, isRequired}: TProps) {
  const selectedOption = React.useMemo(() => {
    if (framework === "tensorflow") {
      return {label: "Tensorflow", value: "tensorflow"};
    } else if (framework === "pytorch") {
      return {label: "Pytorch", value: "pytorch"}
    } else if (framework === "huggingface") {
      return {label: "Accelerate", value: "huggingface"}
    }

    return undefined;
  }, [framework]);

  return (
    <>
      <Select
        label={label ?? "Framework"}
        placeholderText="Select framework"
        disabled={isProcessing}
        isRequired={isRequired}
        data={[{
          options: [
            // {label: "Tensorflow", value: "tensorflow"},
            {label: "Pytorch", value: "pytorch"},
            {label: "Accelerate", value: "huggingface"},
          ],
        }]}
        defaultValue={selectedOption}
        onChange={o => {
          onChange?.(o.value as TFramework);
        }}
      />
    </>
  );
}
