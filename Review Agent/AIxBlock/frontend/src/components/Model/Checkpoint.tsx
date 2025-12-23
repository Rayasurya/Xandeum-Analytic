import React from "react";
import styles from "./Checkpoint.module.scss";
import InputBase from "../InputBase/InputBase";
import Select from "../Select/Select";
import { createAlertInfo } from "@/utils/createAlert";

export type TCheckpointData = {
  checkpoint_source?: "GIT" | "HUGGING_FACE" | "ROBOFLOW" | "KAGGLE" | null;
  checkpoint_id?: string | null;
  checkpoint_token?: string | null;
  checkpoint_username?: string | null;
  checkpoint_path?: string | null;
}

export type TProps = {
  data: TCheckpointData;
  onChange?: (data: TCheckpointData) => void;
  isProcessing?: boolean;
  isRequired?: boolean;
  error?: string | null;
}

export function isValidCheckpoint(checkpointData: TCheckpointData, isRequired: boolean = true): boolean {
  if (!checkpointData.checkpoint_source) {
    return !isRequired;
  }

  switch (checkpointData.checkpoint_source) {
    case "HUGGING_FACE":
    case "ROBOFLOW":
    case "GIT":
      return "checkpoint_id" in checkpointData && (checkpointData.checkpoint_id ?? "").trim().length > 0;
    case "KAGGLE":
      return "checkpoint_id" in checkpointData
        && (checkpointData.checkpoint_id ?? "").trim().length > 0
        && (checkpointData.checkpoint_username ?? "").trim().length > 0
        && (checkpointData.checkpoint_path ?? "").trim().length > 0;
    default:
      return false;
  }
}

export default function Checkpoint({data, onChange, isProcessing, isRequired, error}: TProps) {
  const selectedOption = React.useMemo(() => {
    if (data.checkpoint_source === "GIT") {
      return {label: "Git Repository", value: "GIT"};
    } else if (data.checkpoint_source === "HUGGING_FACE") {
      return {label: "Hugging Face", value: "HUGGING_FACE"};
    } else if (data.checkpoint_source === "ROBOFLOW") {
      return {label: "Roboflow", value: "ROBOFLOW"};
    } else if (data.checkpoint_source === "KAGGLE") {
      return {label: "Kaggle", value: "KAGGLE"};
    }

    return {label: "(no checkpoint)", value: ""};
  }, [data.checkpoint_source]);

  return (
    <>
      <Select
        label="Checkpoint source"
        placeholderText="Select model's checkpoint source"
        data={[{
          options: [
            {label: "(no checkpoint)", value: ""},
            {label: "Git Repository", value: "GIT"},
            {label: "Hugging Face", value: "HUGGING_FACE"},
            // {label: "Roboflow", value: "ROBOFLOW"},
            // {label: "Kaggle", value: "KAGGLE"},
          ],
        }]}
        defaultValue={selectedOption}
        disabled={isProcessing}
        isRequired={isRequired}
        onChange={o => {
          onChange?.({...data, checkpoint_source: o.value as TCheckpointData["checkpoint_source"]});
        }}
        error={error}
      />
      {data.checkpoint_source && (
        <div className={styles.container}>
          <InputBase
            isRequired
            label={data.checkpoint_source === "GIT" ? "Repository URL" : "Checkpoint ID"}
            isControlledValue={true}
            value={data.checkpoint_id ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, checkpoint_id: v.length === 0 ? null : v});
            }}
          />
          <InputBase
            label="Access Token"
            type="password"
            isControlledValue={true}
            value={data.checkpoint_token ?? undefined}
            disabled={isProcessing}
            onChange={ev => {
              const v = ev.currentTarget.value.trim();
              onChange?.({...data, checkpoint_token: v.length === 0 ? null : v});
            }}
          />
          {data.checkpoint_source === "KAGGLE" && (
            <>
              <InputBase
                isRequired
                label={"Kaggle Username"}
                isControlledValue={true}
                value={data.checkpoint_username ?? undefined}
                disabled={isProcessing}
                onChange={ev => {
                  const v = ev.currentTarget.value.trim();
                  onChange?.({...data, checkpoint_username: v.length === 0 ? null : v});
                }}
              />
              <InputBase
                isRequired
                label={"Kaggle Data Path"}
                isControlledValue={true}
                value={data.checkpoint_path ?? undefined}
                disabled={isProcessing}
                onChange={ev => {
                  const v = ev.currentTarget.value.trim();
                  onChange?.({...data, checkpoint_path: v.length === 0 ? null : v});
                }}
              />
            </>
          )}
        </div>
      )}
      {data.checkpoint_source === "HUGGING_FACE" && (
        <div style={{opacity: isProcessing ? 0.2 : 1}}>
          {createAlertInfo((
            <>
              <div>
                Using private/gated Hugging Face checkpoints requires an access token.
                Please verify that you have the necessary permissions to access the specified checkpoint on the Hugging Face platform.
              </div>
              <p>Related resources:</p>
              <ul>
                <li>
                  <a href="https://huggingface.co/docs/hub/security-tokens" target="_blank" rel="noreferrer">
                    How to get Access Token?
                  </a>
                </li>
                <li>
                  <a href="https://huggingface.co/docs/hub/models-gated" target="_blank" rel="noreferrer">
                    What is gated models?
                  </a>
                </li>
              </ul>
            </>
          ), false)}
        </div>
      )}
    </>
  );
}
