import { DataSelect } from "@/components/Select/Select";

export const dataFramework: DataSelect[] = [
  {
    label: "Select Framework",
    options: [
      { label: "Pytorch", value: "pytorch" },
      // { label: "Tensorflow", value: "tensowflow" },
      { label: "Accelerate", value: "huggingface" },
    ],
  },
];

export const dataModelType: DataSelect[] = [
  {
    label: "Select Model Type",
    options: [
      { label: "Training", value: "training" },
      // { label: "Tensorflow", value: "tensowflow" },
      { label: "Inference", value: "inference" },
    ],
  },
];
