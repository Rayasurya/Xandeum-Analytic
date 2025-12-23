import React, { Dispatch } from "react";
import Button from "@/components/Button/Button";
import { confirmDialog } from "@/components/Dialog";
import InputBase from "@/components/InputBase/InputBase";
import Table, { TableActions } from "@/components/Table/Table";
import {Config, CONFIG_TYPE, TMLConfig, TTrainingConfig} from "../Index";
import styles from "../Node.module.scss";
import {TProjectModel} from "@/models/project";
import Switch from "@/components/Switch/Switch";

type TFormConfig = {
  config?: {[key: string]: Config},
  setConfig?: Dispatch<React.SetStateAction<{[key: string]: Config}>>,
  setCurrentConfigTab: Dispatch<React.SetStateAction<CONFIG_TYPE>>;
  currentConfigTab: string;
  trainingConfig: TTrainingConfig;
  setTrainingConfig: Dispatch<React.SetStateAction<TTrainingConfig>>;
  catalogModelKey: string;
  dataTypes: TProjectModel["data_types"];
}

const FormConfig = (props: TFormConfig) => {
  const isGeneral = React.useMemo(() => props.currentConfigTab === CONFIG_TYPE.general, [props.currentConfigTab]);
  const isTypeLLM = React.useMemo(() => ["generative_ai", "nlp", "llm"].includes(props.catalogModelKey), [props.catalogModelKey]);
  const isTypeASR = React.useMemo(() => ["audio_speech_processing"].includes(props.catalogModelKey), [props.catalogModelKey]);

  const isTypeVideo = React.useMemo(
    () => "video" in props.dataTypes || Object.values(props.dataTypes).includes("Video" as any),
    [props.dataTypes]
  );

  const isTypeImage = React.useMemo(
    () => "image" in props.dataTypes || Object.values(props.dataTypes).includes("Image" as any),
    [props.dataTypes]
  );

  return (
    <>
      <div className={styles.NodeConfig}>
        <Button
          className={`${styles.NodeConfigTab} ${props.currentConfigTab === "general" ? styles.NodeConfigTabActive : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.general)}>
          General
        </Button>
        <Button
          className={`${styles.NodeConfigTab} ${props.currentConfigTab === "train" ? styles.NodeConfigTabActive : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.train)}
        >
          Train
        </Button>
        <Button
          className={`${styles.NodeConfigTab} ${props.currentConfigTab === "predict" ? styles.NodeConfigTabActive : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.predict)}>
          Predict
        </Button>
        <Button
          className={`${styles.NodeConfigTab} ${props.currentConfigTab === "dashboard" ? styles.NodeConfigTabActive : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.dashboard)}>
          Dashboard
        </Button>
        <Button
          className={`${styles.NodeConfigTab} ${props.currentConfigTab === "demo" ? styles.NodeConfigTabActive : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.demo)}>
          Demo
        </Button>
      </div>
      {isGeneral && (
        <div className={styles.TrainingConfig}>
          <InputBase
            label="Epochs"
            value={(props.trainingConfig.epochs ?? 10).toString()}
            allowClear={false}
            placeholder="Number of Epochs"
            type="number"
            isControlledValue={true}
            validateNonNegativeInteger={true}
            onChange={e => props.setTrainingConfig(c => ({
              ...c,
              epochs: Math.min(Math.max(parseInt(e.target.value), 1), 1000),
            }))}
          />
          <InputBase
            label="Steps / epoch"
            value={(props.trainingConfig.steps_per_epochs ?? 10).toString()}
            allowClear={false}
            placeholder="Steps per Epochs"
            type="number"
            isControlledValue={true}
            validateNonNegativeInteger={true}
            onChange={e => props.setTrainingConfig(c => ({
              ...c,
              steps_per_epochs: Math.min(Math.max(parseInt(e.target.value), 1), 500),
            }))}
          />
          <InputBase
            label="Batch size"
            value={(props.trainingConfig.batch_size ?? 2).toString()}
            allowClear={false}
            placeholder="Batch size"
            type="number"
            isControlledValue={true}
            validateNonNegativeInteger={true}
            onChange={e => props.setTrainingConfig(c => ({
              ...c,
              batch_size: Math.min(Math.max(parseInt(e.target.value), 1), 1000),
            }))}
          />
          {isTypeLLM && (
            <>
              <InputBase
                label="Token length"
                value={(props.trainingConfig.llm_token ?? 4096).toString()}
                allowClear={false}
                placeholder="Enter token length"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, llm_token: Math.max(parseInt(e.target.value), 1)}))}
              />
            </>
          )}
          {isTypeASR && (
            <>
              <InputBase
                label="Sampling frequency"
                value={(props.trainingConfig.asr_frequency ?? 48000).toString()}
                allowClear={false}
                placeholder="Sampling frequency"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, asr_frequency: Math.max(parseInt(e.target.value), 1)}))}
              />
              <Switch
                label="Is Mono?"
                onChange={v => props.setTrainingConfig(c => ({...c, asr_mono: v}))}
                checked={!!props.trainingConfig.asr_mono}
              />
            </>
          )}
          {isTypeVideo && (
            <>
              <InputBase
                label="FPS"
                value={(props.trainingConfig.video_fps ?? 24).toString()}
                allowClear={false}
                placeholder="Video FPS"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, video_fps: Math.max(parseInt(e.target.value), 1)}))}
              />
              <InputBase
                label="Video quality: 320, 480, 720, 1080..."
                value={(props.trainingConfig.video_quality ?? 320).toString()}
                allowClear={false}
                placeholder="Video Quality"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, video_quality: Math.max(parseInt(e.target.value), 1)}))}
              />
            </>
          )}
          {isTypeImage && (
            <>
              <InputBase
                label="Image width"
                value={(props.trainingConfig.image_width ?? 213).toString()}
                allowClear={false}
                placeholder="Image width"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, image_width: Math.max(parseInt(e.target.value), 1)}))}
              />
              <InputBase
                label="Image height"
                value={(props.trainingConfig.image_height ?? 213).toString()}
                allowClear={false}
                placeholder="Image height"
                type="number"
                isControlledValue={true}
                validateNonNegativeInteger={true}
                onChange={e => props.setTrainingConfig(c => ({...c, image_height: Math.max(parseInt(e.target.value), 1)}))}
              />
            </>
          )}
        </div>
      )}
      {!isGeneral && (
        <>
          <InputBase
            label="Entry file"
            placeholder="Leave blank to use main.py as your entry file"
            value={props.config?.[props.currentConfigTab].entry_file}
            allowClear={false}
            onChange={e => {
              const v = e.target.value.trim();
              props.setConfig?.(c => ({
                ...c,
                [props.currentConfigTab]: { ...c[props.currentConfigTab], entry_file: v.length > 0 ? v : "" }
              }));
            }}
          />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button
              size="tiny"
              type="hot"
              onClick={() => {
                confirmDialog({
                  title: "Clear arguments",
                  message: "Are you sure you want to remove all arguments? This action cannot be reversed.",
                  onSubmit: () => {
                    props.setConfig?.(c => ({ ...c, [props.currentConfigTab]: { ...c[props.currentConfigTab], arguments: [] } }));
                  },
                });
              }}
            >
              Clear Args
            </Button>
            &nbsp;
            <Button
              size="tiny"
              type="primary"
              onClick={() => {
                props.setConfig?.(c => ({ ...c, [props.currentConfigTab]: { ...c[props.currentConfigTab], arguments: [...c[props.currentConfigTab].arguments, { name: "", value: "" }] } }));
              }}
            >
              Add Args
            </Button>
          </div>
          <div style={{ marginTop: 16 }}>
            <Table
              columns={[
                {
                  label: "#",
                  dataKey: "idx",
                  renderer: (_, idx) => (idx ?? 0) + 1,
                },
                {
                  label: "Argument",
                  dataKey: "name",
                  renderer: (row: TMLConfig["arguments"][0], idx) => {
                    return (
                      <InputBase
                        value={row.name}
                        placeholder="E.g: --epochs"
                        onChange={e => {
                          props.setConfig?.(c => {
                            return typeof idx === "number" ? {
                              ...c,
                              [props.currentConfigTab]: {
                                ...c[props.currentConfigTab], arguments: c[props.currentConfigTab].arguments.map((arg, i) => {
                                  if (i === idx) {
                                    return { name: e.target.value, value: arg.value };
                                  }

                                  return arg;
                                }),
                              }
                            } : c
                          });
                        }}
                      />
                    );
                  },
                },
                {
                  renderer: () => "=",
                },
                {
                  label: "Value",
                  dataKey: "value",
                  renderer: (row: TMLConfig["arguments"][0], idx) => {
                    return (
                      <InputBase
                        value={row.value}
                        placeholder="Argument value"
                        onChange={e => {
                          props.setConfig?.(c => {
                            return typeof idx === "number" ? {
                              ...c,
                              [props.currentConfigTab]: {
                                ...c[props.currentConfigTab], arguments: c[props.currentConfigTab].arguments.map((arg, i) => {
                                  if (i === idx) {
                                    return { name: arg.name, value: e.target.value };
                                  }
                                  return arg;
                                }),
                              }
                            } : c
                          });
                        }}
                      />
                    );
                  },
                },
                {
                  renderer: (_: TMLConfig["arguments"][0], idx) => {
                    return (
                      <TableActions
                        actions={[
                          {
                            icon: "DELETE",
                            onClick: () => {
                              props.setConfig?.(c => {
                                return typeof idx === "number" ? {
                                  ...c,
                                  [props.currentConfigTab]: {
                                    ...c[props.currentConfigTab], arguments: c[props.currentConfigTab].arguments.filter((_, i) => i !== idx),
                                  }
                                } : c
                              });
                            },
                          }
                        ]}
                      />
                    );
                  },
                },
              ]}
              data={props.config?.[props.currentConfigTab].arguments ?? []}
              headHidden={true}
            />
          </div>
        </>
      )}
    </>
  )
}

export default FormConfig;
