import { Dispatch, SetStateAction } from "react";
import { Field } from "./Index";

const validateDirDatasetPath = (path: string) => {
  const pattern = /^\w+\/\w+$/;
  return pattern.test(path);
}

const validateGitHubUrl = (url: string) => {
  // Remove .git suffix if present
  url = url.replace(/\.git$/, '');
  const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)(\/)?$/;
  return githubUrlPattern.test(url);
}

const validateField = (field: Field, formData: { [key: string]: string } | null): string | null => {
  if (field.required && (!formData?.[field.name] || formData[field.name].trim().length === 0)) {
    return "Please add data some field before import";
  }

  if (field.name === "dataset_path" && formData && formData[field.name]?.trim().length > 0 && !validateDirDatasetPath(formData[field.name])) {
    return "Invalid format for dataset path. Example: abc/abc/...";
  }

  if (field.name === "url" && formData && formData[field.name]?.trim().length > 0 && !validateGitHubUrl(formData[field.name])) {
    return "Invalid format for github url. Example: https://github.com/username/repo";
  }

  return null;
}

export const formRenderValidation = (formData: { [key: string]: string } | null, fields: Field[], setError: Dispatch<SetStateAction<string | null>>) => {
  let hasError = false;
  let newError: string | null = null;

  for (const field of fields) {
    const error = validateField(field, formData);
    if (error) {
      newError = error;
      hasError = true;
      break;
    }
  }
  
  setError(newError);

  return hasError;
}
