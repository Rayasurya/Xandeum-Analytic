import React from "react";
import Select from "../Select/Select";
import InputBase from "../InputBase/InputBase";
import styles from "./Source.module.scss";
import Upload from "../Upload/Upload";
import {createAlertInfo} from "@/utils/createAlert";

export type TModelSources = "GIT" | "DOCKER_HUB" | /*"ROBOFLOW" |*/ "HUGGING_FACE" | "LOCAL";

export type TSourceData = {
  docker_image?: string | null;
  docker_access_token?: string | null;
  file?: Blob | null;
  model_source?: TModelSources | null;
  model_id?: string | null;
  model_token?: string | null;
}

export type TProps = {
  data: TSourceData;
  onChange?: (data: TSourceData) => void;
  label?: string;
  disallowedSources?: TModelSources[],
  isProcessing?: boolean;
  isRequired?: boolean;
  isSourceCode?: boolean;
  error?: string | null;
}

export function isValidSourceData(sourceData: TSourceData, isRequired: boolean = true): boolean {
  if (!sourceData.model_source) {
    return !isRequired;
  }

  switch (sourceData.model_source) {
    case "DOCKER_HUB":
      return "docker_image" in sourceData && (sourceData.docker_image ?? "").trim().length > 0;
    case "GIT":
    case "HUGGING_FACE":
      return "model_id" in sourceData && (sourceData.model_id ?? "").trim().length > 0;
    case "LOCAL":
      return !!sourceData.file;
    default:
      return false;
  }
}

export default function Source({data, onChange, label, disallowedSources, isProcessing, isRequired, isSourceCode, error}: TProps) {
  const selectedOption = React.useMemo(() => {
    if (data.model_source === "GIT") {
      return {label: "Git Repository", value: "GIT"};
    } else if (data.model_source === "DOCKER_HUB") {
      return {label: "Docker Hub", value: "DOCKER_HUB"}
    } else if (data.model_source === "LOCAL") {
      return {label: "Local Upload", value: "LOCAL"};
    } else if (data.model_source === "HUGGING_FACE") {
      return {label: "Hugging Face", value: "HUGGING_FACE"};
    } /*else if (data.model_source === "ROBOFLOW") {
      return {label: "Roboflow", value: "ROBOFLOW"};
    }*/

    return undefined;
  }, [data.model_source]);

  const form = React.useMemo(() => {
    if (data.model_source === "DOCKER_HUB") {
      return (
        <div className={styles.container}>
          <InputBase
            isRequired
            label="Docker Image"
            isControlledValue={true}
            value={data.docker_image ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, docker_image: v.length === 0 ? null : v});
            }}
            allowClear={false}
          />
          <InputBase
            label="Access Token"
            type="password"
            isControlledValue={true}
            value={data.docker_access_token ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, docker_access_token: v.length === 0 ? null : v});
            }}
            allowClear={false}
          />
        </div>
      );
    } else if (data.model_source === "GIT" || data.model_source === "HUGGING_FACE" /*|| data.model_source === "ROBOFLOW"*/) {
      return (
        <div className={styles.container}>
          <InputBase
            isRequired
            label={data.model_source === "GIT" ? "Repository URL" : "Model ID"}
            isControlledValue={true}
            value={data.model_id ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, model_id: v.length === 0 ? null : v});
            }}
            allowClear={false}
          />
          <InputBase
            label="Access Token"
            type="password"
            isControlledValue={true}
            value={data.model_token ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, model_token: v.length === 0 ? null : v});
            }}
            allowClear={false}
          />
        </div>
      );
    } else if (data.model_source === "LOCAL") {
      return (
        <div className={styles.uploadForm}>
          <label className={styles.uploadLabel}>Upload your {isSourceCode ? "source code" : "model source"} using .zip file</label>
          <Upload
            name="file"
            onUpload={(file) => onChange?.({ ...data, file: file as Blob })}
            accept={".zip,.zar,application/zip,application/x-zip-compressed,application/octet-stream"}
            className={styles.upload}
            clearFile={() => onChange?.({ ...data, file: null })}
          />
        </div>
      );
    }

    return null;
  }, [data, isProcessing, onChange, isSourceCode]);

  return (
    <>
      <Select
        label={label ?? "Source code"}
        placeholderText="Select source"
        isRequired={isRequired}
        data={[{
          options: [
            {label: "Git Repository", value: "GIT"},
            {label: "Docker Hub", value: "DOCKER_HUB"},
            {label: "Hugging Face", value: "HUGGING_FACE"},
            // {label: "Roboflow", value: "ROBOFLOW"},
            {label: "Local Upload", value: "LOCAL"},
          ].filter(o => !(disallowedSources ?? []).includes(o.value as TModelSources)),
        }]}
        defaultValue={selectedOption}
        disabled={isProcessing}
        onChange={o => {
          onChange?.({...data, model_source: o.value as TSourceData["model_source"]});
        }}
        error={error}
      />
      {form}
      {selectedOption && createAlertInfo("Ensure these models have a Dockerfile in their source and verify you have access to the model (check on HF, Git, or Kaggle, and click accept if needed).", false)}
    </>
  );
}
