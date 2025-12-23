import { DataSelect } from "@/components/Select/Select";

export const dataPrecision: DataSelect[] = [
  {
    label: "Select Precision",
    options: [
      { label: "FP16", value: "fp16" },
      { label: "FP32", value: "fp32" },
    ],
  },
];

export const dataFramework: DataSelect[] = [
  {
    label: "Select Framework",
    options: [
      { label: "Pytorch", value: "pytorch" },
      { label: "Tensorflow", value: "tensowflow" },
      // { label: "Keras", value: "keras" },
      // { label: "Scikit-Learn", value: "scikit-learn" },
      // { label: "Hugging Face", value: "hugging-face" },
      // { label: "OpenNN", value: "opennn" },
      // { label: "PyBrain", value: "pybrain" },
      // { label: "OpenAI", value: "openai" },
      // { label: "IBM Watson", value: "ibm-watson" },
      // {
      //   label: "Microsoft Cognitive Toolkit (CNTK)",
      //   value: "microsoft-cognitive-toolkit",
      // },
      // { label: "DL4J (Deeplearning4j)", value: "dl4j" },
      // { label: "Theano", value: "theano" },
      // { label: "MXNet", value: "mxnet" },
      // { label: "Caffe", value: "caffe" },
      // { label: "XGBoost", value: "xgboost" },
      // { label: "Conclusion", value: "conclusion" },
    ],
  },
];

export const ModelSource: DataSelect[] = [
  {
    label: "Select Model Source",
    options: [
      { label: "Hugging Face", value: "HUGGING_FACE" },
      // { label: "Roboflow", value: "ROBOFLOW" },
      { label: "Git", value: "GIT" },
      { label: "Docker Hub", value: "DOCKER_HUB" },
    ],
  },
];

export const Checkpoint: DataSelect[] = [
  {
    label: "Select Checkpoint",
    options: [
      { label: "Hugging Face", value: "HUGGING_FACE" },
      // { label: "Roboflow", value: "ROBOFLOW" },
      { label: "Git", value: "GIT" },
      // { label: "Kaggle", value: "KAGGLE" },
    ],
  },
];

export const validateDockerImageFormat = (val: string) => {
  // Regex for validating Docker image name and tag
  const pattern = /^(?:[a-z0-9]+(?:(?:[._]|__|[-]*)[a-z0-9]+)*(?::[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127})?)$/;
  return pattern.test(val);
}

export const validateGitHubUrl = (url: string) => {
  // Remove .git suffix if present
  url = url.replace(/\.git$/, '');
  const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)(\/)?$/;
  return githubUrlPattern.test(url);
}

