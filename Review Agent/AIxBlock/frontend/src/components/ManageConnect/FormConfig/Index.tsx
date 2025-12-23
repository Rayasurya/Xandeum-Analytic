import React, { Dispatch } from "react";
import Button from "../../Button/Button";
import { confirmDialog } from "../../Dialog";
import InputBase from "../../InputBase/InputBase";
import Table, { TableActions } from "../../Table/Table";
import { CONFIG_TYPE, Config, TMLConfig } from "../ManageConnect";

type TFormConfig = {
  config?: {
    [key: string]: Config;
  },
  setConfig?: Dispatch<React.SetStateAction<{
    [key: string]: Config;
  }>>,
  setCurrentConfigTab: Dispatch<React.SetStateAction<CONFIG_TYPE>>;
  currentConfigTab: string;
}

const FormConfig = (props: TFormConfig) => {
  return (
    <>
      <div className="c-connect-config__tab">
        <Button
          className={`tab-config ${props.currentConfigTab === "train" ? "active" : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.train)}
        >
          Train
        </Button>
        <Button
          className={`tab-config ${props.currentConfigTab === "predict" ? "active" : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.predict)}>
          Predict
        </Button>
        <Button
          className={`tab-config ${props.currentConfigTab === "dashboard" ? "active" : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.dashboard)}>
          Dashboard
        </Button>
        <Button
          className={`tab-config ${props.currentConfigTab === "demo" ? "active" : ""}`}
          onClick={() => props.setCurrentConfigTab(CONFIG_TYPE.demo)}>
          Demo
        </Button>
      </div>
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
  )
}

export default FormConfig;
