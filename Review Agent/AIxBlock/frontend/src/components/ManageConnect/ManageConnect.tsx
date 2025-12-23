import IconThreeDot from "@/assets/icons/IconThreeDot";
import { TMLBackend } from "@/models/mlBackend";
import { useApi } from "@/providers/ApiProvider";
import Button from "../Button/Button";
import "./ManageConnect.scss";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import React, { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useUpdateStartStopDockerML } from "@/hooks/settings/ml/useStartStopDockerML";
import { confirmDialog, infoDialog } from "../Dialog";
import Dropdown from "../Dropdown/Dropdown";
import DropdownItem, { TDropdownItem } from "../DropdownItem/DropdownItem";
import IconMlStart from "@/assets/icons/IconMlStart";
import { IconMinus, IconMl, IconMlStop, IconPlus } from "@/assets/icons/Index";
import IconMlReset from "@/assets/icons/IconMlReset";
import IconPlay from "@/assets/icons/IconPlay";
import IconStopPlay from "@/assets/icons/IconStopPlay";
import { TComputeGPU } from "@/hooks/computes/useRentedGpu";
import { convertFLOP, formatFloat } from "@/utils/customFormat";
import Modal from "../Modal/Modal";
import AppLoading from "../AppLoading/AppLoading";
import RentedComputeItem from "@/pages/Computes/RentedComputeItem";
import dayjs from "dayjs";
import FormConfig from "./FormConfig/Index";
import Spin from "../Spin/Spin";

interface IManageProps {
  data: TMLBackend;
  onDeleted?: () => void;
  refresh?: () => void;
  hasMaster?: boolean,
  openDashboard: (backend: TMLBackend) => void,
  centrifugeToken: string,
  isMasterNode?: boolean;
  proxyUrl?: string;
  isNetWorkDisconnected?: boolean;
  projectID?: number;
  netWorkId?: number | undefined;
}

export const ActionML = {
  STOP: "Stop",
  START: "Start",
  DELETE: "Delete",
};

export const MLBackendState = {
  CONNECTED: "CO",
  DISCONNECTED: "DI",
  ERROR: "ER",
  TRAINING: "TR",
  PREDICTING: "PR",
};

export const MLStatus = {
  MASTER: "master",
  WORKER: "worker",
  JOIN_MASTER: "join_master",
  REJECT_MASTER: "reject_master",
  TRAINING: "training",
  STOP: "stop",
  FINISH: "finish",
}

export const INTSTALL_STATUS = {
  INSTALLING: "installing",
  COMPLEATED: "compleated",
  FAILED: "failed",
  RE_INSTALLING: "reinstalling",
}

export enum CONFIG_TYPE {
  train = "train",
  predict = "predict",
  dashboard = "dashboard",
  demo = "demo",
}

export type Config = {
  entry_file: string,
  arguments: Exclude<TMLBackend["arguments"], null | undefined>,
  type: CONFIG_TYPE | null,
};

export type TDataMl = TMLBackend & {
  compute_gpu: TComputeGPU & {
    end_time?: string;
    start_time?: string;
    ip_address?: string;
    service_type?: string;
    cpu?: string;
    image?: string;
  },
  config: Config[],
}

export type TMLConfig = {
  entry_file: string,
  arguments: Exclude<TMLBackend["arguments"], null | undefined>,
}

export const initConfigs = {
  "train": {
    entry_file: "",
    arguments: [],
    type: CONFIG_TYPE.train
  },
  "predict": {
    entry_file: "",
    arguments: [],
    type: CONFIG_TYPE.predict
  },
  "dashboard": {
    entry_file: "",
    arguments: [],
    type: CONFIG_TYPE.dashboard
  },
  "demo": {
    entry_file: "",
    arguments: [],
    type: CONFIG_TYPE.demo,
  }
}

const ManageConnect: React.FC<IManageProps> = ({ 
  data,
  onDeleted,
  refresh,
  hasMaster,
  openDashboard,
  // centrifugeToken,
  isMasterNode,
  isNetWorkDisconnected,
  projectID, 
  netWorkId,
  proxyUrl,
}) => {
  const api = useApi();
  const { addPromise } = usePromiseLoader();
  const { onUpdateStartStop, loading: loadingStartStopDocker } = useUpdateStartStopDockerML();
  const [dataMl, setDataMl] = useState<TDataMl>(data as TDataMl);
  const [isShowDetailNode, setShowDetailNode] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isResetLoading, setResetLoading] = useState<boolean>(false);
  // const [isShowLogModal, setShowLogModal] = useState<boolean>(false);
  // const logRef = useRef<HTMLPreElement>(null);
  // const scrollToEndRef = useRef<boolean>(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<{ [key: string]: Config }>(initConfigs);
  const [currentConfigTab, setCurrentConfigTab] = useState<CONFIG_TYPE>(CONFIG_TYPE.train);

  const onCloseModelConfig = () => {
    setShowConfig(false);
    setConfig(initConfigs);
  }

  // useEffect(() => {
  //   let channel_ml = "training_logs"
  //   if(dataMl.id.toString()){
  //     channel_ml = 'ml_logs_' + dataMl.id.toString()
  //   }
  //   if (isShowLogModal) {
  //     // const clientToken = getClientToken();
  //     const transports = [
  //       {
  //         transport: 'websocket',
  //         endpoint: 'wss://rt.aixblock.io/centrifugo/connection/websocket',
  //       }
  //     ];
  //     const centrifuge = new Centrifuge(transports as any, {
  //       token: centrifugeToken,
  //     });
  //
  //     centrifuge.on('connected' as any, function (context: any) {
  //       console.log('connected', context);
  //       console.log('connected', channel_ml);
  //
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Connected to logger transporter\n";
  //       }
  //     });
  //
  //     centrifuge.on('connecting' as any, function (context: any) {
  //       console.log('connecting', context);
  //
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Connecting...\n";
  //       }
  //     });
  //
  //     centrifuge.on('disconnected' as any, function (context: any) {
  //       console.log('disconnected', context);
  //
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Disconnected\n";
  //       }
  //     });
  //
  //     // const subscription = centrifuge.newSubscription("training_logs", {
  //     //   getToken: async () => getSubscriptionToken("training_logs"),
  //     // });
  //     // const subscription = centrifuge.newSubscription('training_logs_' + dataMl.id);
  //
  //     const subscription = centrifuge.newSubscription(channel_ml);
  //
  //     subscription.on('publication', (context) => {
  //       if (!logRef.current) {
  //         return;
  //       }
  //
  //       logRef.current.innerHTML += context.data.log + "\n";
  //
  //       if (scrollToEndRef.current) {
  //         logRef.current.scrollTo({top: logRef.current.scrollHeight});
  //       }
  //     });
  //
  //     subscription.history({ 'since': { 'offset': 2, 'epoch': 'xcf4w' }, limit: 100 }).then(function (ctx) {
  //       console.log(ctx.publications);
  //     }, function (err) {
  //       // history call failed with error
  //     });
  //
  //
  //     subscription.subscribe();
  //     centrifuge.connect();
  //
  //     return () => {
  //       subscription.unsubscribe();
  //       centrifuge.disconnect();
  //     };
  //   }
  // }, [isShowLogModal, dataMl.id, centrifugeToken]);

  const refreshBackendInformation = useCallback(async () => {
    try {
      const ar = api.call("getMlBackendByMlId", {
        params: { id: dataMl.id.toString() },
      });
      addPromise(ar.promise, "Refresh ML information...");
      const res = await ar.promise;
      const jsonData = await res.json();
      setDataMl(jsonData);
    } catch (error) {
      console.log(error)
    }
  }, [api, dataMl.id, addPromise]);

  const controlDockerContainer = useCallback(async (action: string, needToRefresh: boolean = true) => {
    try {
      const ar = onUpdateStartStop(action, dataMl.id.toString());
      const res = await ar.promise;

      if (!res.ok) {
        const data = await res.json();

        if (Object.hasOwn(data, "detail")) {
          infoDialog({message: "Server error: " + data["detail"]});
        } else {
          infoDialog({
            message: "An error ocurred (" + res.statusText + "). Please try again!",
          });
        }

        return;
      }
      if(dataMl.status === MLStatus.MASTER){
        // eslint-disable-next-line react-hooks/exhaustive-deps
        hasMaster = false
        console.log(trainButtonLabel)
      }

      if (needToRefresh) {
        await refreshBackendInformation();
      }
    } catch (error) {
      if (error instanceof Error) {
        infoDialog({message: error.message});
      } else {
        infoDialog({message: `An error occurred while ${action}. Please try again!`});
      }
    }
  }, [onUpdateStartStop, dataMl.id, addPromise, refreshBackendInformation]);

  const deleteContainer = useCallback(async () => {
    controlDockerContainer(ActionML.DELETE.toLowerCase())
      .then(() => {
        const ar = api.call("delMLBackend", {
          params: {id: dataMl.id.toString()},
        });
        addPromise(ar.promise, "Deleting ML backend...");
        ar.promise.finally(() => onDeleted?.());
      })
      .catch((error) => {
        console.error("Error updating Docker ML:", error);
        // Handle error if necessary
        if (error instanceof Error) {
          infoDialog({message: error.message});
        } else {
          infoDialog({message: `An error occurred while delete. Please try again!`})
        }
      });
  }, [controlDockerContainer, api, dataMl.id, addPromise, onDeleted]);

  const resetContainer = useCallback(async () => {
    setResetLoading(true);
    const ar = api.call("resetMLNodes", {
      params: { id: dataMl.id.toString() },
    });

    ar.promise.then((res) => {
      if (res.ok) {
        refresh?.();
      } else {
        infoDialog({
          message: "Some thing when wrong!",
        });
      }
    })
      .finally(() => {
        setResetLoading(false);
      });
  }, [api, dataMl.id, refresh]);

  const onDisconnectNetWork = useCallback(async () => {
    const ar = api.call("disconectNetWork", {
      params: { 
        network_id: netWorkId?.toString() ?? "",
      },
      query: new URLSearchParams({
        ml_id: dataMl.id.toString(),
        project_id: projectID?.toString() ?? "",
      }),
    });
    
    ar.promise.then(async (res) => {
      if (res.ok) {
        refresh?.();
      } else {
        infoDialog({
          message: "Some thing when wrong!",
        });
      }
    }).catch(() => {
    })
      .finally(() => {
        if (ar.controller.signal.aborted) return;
      })
  }, [api, dataMl.id, refresh, netWorkId, projectID]);

  const onJoinNetWork = useCallback(async () => {
    const ar = api.call("joinNetWork", {
      params: { 
        network_id: netWorkId?.toString() ?? "",
      },
      query: new URLSearchParams({
        ml_id: dataMl.id.toString(),
        project_id: projectID?.toString() ?? "",
      }),
    });
    ar.promise.then(async (res) => {
      if (res.ok) {
        refresh?.();
      } else {
        infoDialog({
          message: "Some thing when wrong!",
        });
      }
    }).catch(() => {
    })
      .finally(() => {
        if (ar.controller.signal.aborted) return;
      })
  }, [api, dataMl.id, refresh, netWorkId, projectID]);

  let dropdownItemsBase: TDropdownItem[] = useMemo(() => [
    // {
    //   label: "Logs",
    //   handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    //     e.preventDefault();
    //     setShowLogModal(true);
    //   },
    // },
    {
      label: "Delete",
      handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();
        confirmDialog({
          title: "Delete node",
          message: "Are you sure you want to delete this node?",
          onSubmit: () => deleteContainer(),
        });
      },
    },
    {
      label: "Detail",
      handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();
        setShowDetailNode(true);
      },
    },
    {
      label: "Configure",
      handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault();
        setShowConfig(true);
        const getConfig = (type: CONFIG_TYPE) => {
          return dataMl.config?.find((item) => item.type === type);
        };
        setConfig({
          "train": {
            entry_file: getConfig(CONFIG_TYPE.train)?.entry_file ?? "",
            arguments: getConfig(CONFIG_TYPE.train)?.arguments ?? [],
            type: CONFIG_TYPE.train
          },
          "predict": {
            entry_file: getConfig(CONFIG_TYPE.predict)?.entry_file ?? "",
            arguments: getConfig(CONFIG_TYPE.predict)?.arguments ?? [],
            type: CONFIG_TYPE.predict
          },
          "dashboard": {
            entry_file: getConfig(CONFIG_TYPE.dashboard)?.entry_file ?? "",
            arguments: getConfig(CONFIG_TYPE.dashboard)?.arguments ?? [],
            type: CONFIG_TYPE.dashboard
          },
          "demo": {
            entry_file: getConfig(CONFIG_TYPE.demo)?.entry_file ?? "",
            arguments: getConfig(CONFIG_TYPE.demo)?.arguments ?? [],
            type: CONFIG_TYPE.demo
          }
        })
      },
    },
  ], [deleteContainer, dataMl.config]);

  const dropdownItems = useMemo(() => {
    let items = [...dropdownItemsBase];
    if (isMasterNode) {
      return items;
    } else if (!isMasterNode && isNetWorkDisconnected) {
      items.push({
        label: "Join network",
        handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.preventDefault();
          onJoinNetWork();
        },
      });
    } else {
      items.push({
        label: "Disconnect network",
        handler: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.preventDefault();
          onDisconnectNetWork();
        },
      });
    }
    return items;
  }, [
    dropdownItemsBase,
    isMasterNode,
    isNetWorkDisconnected,
    onDisconnectNetWork,
    onJoinNetWork,
  ]);

  const startTraining = useCallback(() => {
    setLoading(true);
    const ar = api.call("startTrain", {
      params: { id: dataMl.id.toString() },
      credentials: "include",
    });
    
    ar.promise.then(async (res) => {
      if (res.ok) {
        // infoDialog({message: "Training has successfully started."});
        // asyncDataMl();
        refresh?.();
        // await refreshBackendInformation();
      } else {
        infoDialog({
          message: "An error occurred while starting training. Please try again!",
        });
      }
    })
    .finally(() => {
      if (ar.controller.signal.aborted) return;
      setLoading(false);
    })
  }, [api, dataMl.id, refresh]);

  const onStopOrRejectTraining = useCallback(async () => {
    setLoading(true);
    const ar = api.call("stopTrain", {
      params: { id: dataMl.id.toString() },
    });
    ar.promise.then(async (res) => {
      if (res.ok) {
        refresh?.();
      } else {
        infoDialog({
          message: "Some thing when wrong!",
        });
      }
    })
    .finally(() => {
      if (ar.controller.signal.aborted) return;
      setLoading(false);
    })

  }, [api, dataMl.id, refresh]);

  const stopTraining = useCallback(async () => {
    await controlDockerContainer(ActionML.STOP.toLowerCase(), false);
    // await controlDockerContainer(ActionML.START.toLowerCase(), false);
    refresh?.();
  }, [controlDockerContainer, refresh]);

  const trainButtonState = useMemo(() => {
    if (dataMl.status === MLStatus.MASTER && dataMl.status_training === MLStatus.TRAINING) {
      return 1;
    } else if (dataMl.status === MLStatus.WORKER && hasMaster) {
      if (dataMl.status_training === MLStatus.JOIN_MASTER) {
        if (data.network_history?.status === "disconnected") {
          return 0;
        }
        return 2;
      }

      if (dataMl.status_training === MLStatus.REJECT_MASTER) {
        if (data.network_history?.status === "disconnected") {
          return 1;
        }
        return 3;
      }
    }

    return 0;
  }, [dataMl.status, dataMl.status_training, hasMaster, data.network_history?.status]);

  const trainButtonLabel = useMemo(() => [
    "Start Training",
    "Stop Training",
    "JOIN MASTER",
    "Reject Master",
  ][trainButtonState], [trainButtonState]);

  const trainButtonClass = useMemo(() => [
    "start-training",
    "stop-training",
    "join-master",
    "reject-master",
  ][trainButtonState], [trainButtonState]);

  const trainButtonIcon = useMemo(() => [
    <IconPlay color="#BBBBD5" />,
    <IconStopPlay />,
    <IconPlus width={14} height={14} />,
    <IconMinus />,
  ][trainButtonState], [trainButtonState]);

  const trainButtonHandler = useMemo(() => [
    startTraining,
    onStopOrRejectTraining,
    startTraining,
    onStopOrRejectTraining,
  ][trainButtonState], [startTraining, onStopOrRejectTraining, trainButtonState]);

  useEffect(() => {
    setDataMl(data as TDataMl);
  }, [data]);

  const { x } = convertFLOP(Number(dataMl?.compute_gpu?.gpu_tflops) ?? 0);

  const saveConfig = useCallback(() => {
    for (let i = 0; i < config[currentConfigTab].arguments.length; i++) {
      if (config[currentConfigTab].arguments[i].name.trim().length === 0) {
        infoDialog({
          title: "Argument error",
          message: `The name of the argument #${i + 1} is empty. Please this argument or give it a name.`,
          className: "c-connect__args-model"
        });
        return;
      }
    }

    setShowConfig(false);
    const configsBody = Object.keys(config).map(key => ({
      entry_file: config[key].entry_file,
      arguments: config[key].arguments,
      type: config[key].type
    }));

    const ar = api.call("updateMLConfig", {
      params: { id: dataMl.id.toString() },
      body: {
        config: configsBody
      },
    });

    addPromise(ar.promise, "Updating ML backend config...");

    ar.promise
      .then(r => {
        if (r.ok) {
          setDataMl(ml => ({ ...ml, ...configsBody }));
          refresh?.();
          return;
        }
      })
      .catch(() => {
        setShowConfig(true);
      })
      .finally(() => {
        setConfig(initConfigs);
      });
  }, [addPromise, refresh, api, currentConfigTab, dataMl, config]);

  return (
    <>
      <div className={`c-connect ${dataMl.install_status}`}>
        {proxyUrl &&
          <span className="c-ml__last-text">
            {proxyUrl ? <span className="endpoint"><span>End Point:</span> {proxyUrl}</span> : "End Point: No Proxy URL available"}
          </span>
        }
        <div className="c-connect__header">
          <div className={`c-connect__title ${dataMl.status === MLStatus.MASTER ? "master" : "worker"}`}>
            <div className="flex gap-4">
              {dataMl.status === MLStatus.MASTER ? "Master Node" : "Worker Node"}
              <Dropdown
                icon={<IconThreeDot />}
                // className="c-connect__status--action"
                placement="left"
                arrow={true}
              >
                <DropdownItem data={dropdownItems as TDropdownItem[]} />
              </Dropdown>
            </div>
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              (dataMl.status === MLStatus.TRAINING || dataMl.state === MLBackendState.CONNECTED) &&
              <p className={`c-connect__desc working`}>
                Is working
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              dataMl.state === MLBackendState.DISCONNECTED &&
              <p className={`c-connect__desc ${dataMl.status}`}>
                Has stopped working
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              dataMl.status === MLStatus.FINISH &&
              <p className={`c-connect__desc ${dataMl.status}`}>
                Finish
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              <p className={`c-connect__desc ${dataMl.install_status}`}>
                {dataMl.install_status === INTSTALL_STATUS.COMPLEATED &&
                  dataMl.state !== MLBackendState.CONNECTED &&
                  dataMl.state !== MLBackendState.DISCONNECTED && 
                  dataMl.state !== "ER"
                  &&
                  <>
                    <span>You have successfully installed,</span><br />
                    <span>click <button>start</button> to begin training</span>
                  </>
                }
                {(dataMl.install_status === INTSTALL_STATUS.FAILED ) &&
                  <>
                    <span>Your installation has failed.</span><br />
                    <span>Please click <button>'Reset'</button> to reinstall</span>
                  </>
                }

                {(dataMl.install_status === INTSTALL_STATUS.COMPLEATED && (dataMl.state === "ER" || dataMl.state !== MLBackendState.DISCONNECTED )) &&
                  <>
                  <span>Stopped.</span><br />
                  <span>Please click <button>Start</button></span>
                  </>
                }
              </p>
            }
            {dataMl.install_status === INTSTALL_STATUS.INSTALLING &&
              <p className={`c-connect__desc ${dataMl.status}`}>
                installing
              </p>
            }
            {dataMl.install_status === INTSTALL_STATUS.RE_INSTALLING &&
              <p className={`c-connect__desc ${dataMl.status}`}>
                reinstalling
              </p>
            }
            {isNetWorkDisconnected &&
              <p className={`c-connect__desc network-disconnected`}>
                Network disconnected
              </p>
            }
          </div>
          <div className="c-connect__action">
            {(dataMl.install_status === INTSTALL_STATUS.COMPLEATED || dataMl.install_status === INTSTALL_STATUS.INSTALLING) &&
              <>
                {dataMl.state === MLBackendState.CONNECTED
                  ? (
                    <>
                      {dataMl.install_status !== INTSTALL_STATUS.INSTALLING && <button
                        className={`c-connect__action-item ${loadingStartStopDocker ? "loading" : ""}`}
                        onClick={(stopTraining)}
                        disabled={
                          loadingStartStopDocker ||
                          isLoading ||
                          isResetLoading ||
                          (dataMl.install_status === INTSTALL_STATUS.FAILED && isNetWorkDisconnected)
                        }
                      >
                        {loadingStartStopDocker ?
                          <Spin size="md" loading={loadingStartStopDocker} /> :
                          <>
                            <IconMlStop />
                            Stop
                          </>
                        }
                      </button>}
                    </>
                  ) : (
                    <>
                      {
                        dataMl.install_status !== INTSTALL_STATUS.INSTALLING && <button
                          className={`c-connect__action-item ${loadingStartStopDocker ? "loading" : ""}`}
                          onClick={() => {
                            controlDockerContainer(ActionML.START.toLowerCase());
                          }}
                          disabled={
                            loadingStartStopDocker ||
                            isLoading ||
                            isResetLoading ||
                            (dataMl.install_status === INTSTALL_STATUS.FAILED && isNetWorkDisconnected)
                          }
                        >
                          {loadingStartStopDocker ?
                            <Spin size="md" loading={loadingStartStopDocker} /> :
                            <>
                              <IconMlStart />
                              Start
                            </>
                          }
                        </button>
                      }
                    </>
                  )}
              </>
            }
            {(dataMl.install_status === INTSTALL_STATUS.INSTALLING || dataMl.install_status === INTSTALL_STATUS.RE_INSTALLING) ?
              (<span
                className="c-connect__action-item "
              >
                <IconMlReset />
                {dataMl.install_status === INTSTALL_STATUS.INSTALLING ? "Installing" : "Re Installing"}
              </span>) : (
                <button
                  className={`c-connect__action-item ${isResetLoading ? "loading" : ""}`}
                  onClick={resetContainer}
                  disabled={loadingStartStopDocker || isLoading}
                >
                  {isResetLoading ?
                    <Spin size="md" loading={isResetLoading} /> :
                    <>
                      <IconMlReset />
                      Reset
                    </>
                  }
                </button>
              )
            }
          </div>
        </div>
        <div className="c-connect__body">
          <div className="c-connect__body-item">
            <div className="c-connect__body-item--icon">
              <IconMl />
            </div>
            <div>
              <div className="c-connect__body-item__content">
                <strong>{dataMl?.compute_gpu.gpu_name}</strong>
              </div>
              <div className="c-connect__body-item__content">
                <strong>{x}{" "}TFLOPS</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="c-connect__footer">
          <div className="c-connect__action between">
            <Button
              size="small"
              className={"c-connect--click " + trainButtonClass}
              onClick={trainButtonHandler}
              disabled={dataMl.state !== MLBackendState.CONNECTED || isResetLoading || loadingStartStopDocker}
            >
              {isLoading 
                ? <Spin loading={isLoading} /> : 
                <>
                {trainButtonIcon}
                {trainButtonLabel}
                </>
              }
            </Button>
            <Button
              size="small"
              className="c-connect--click dashboard"
              onClick={() => openDashboard(data)}
              disabled={dataMl.state !== MLBackendState.CONNECTED || isResetLoading || loadingStartStopDocker
              }>
              Dashboard
            </Button>
          </div>
        </div>
        <Suspense fallback={<AppLoading />}>
          <Modal
            open={isShowDetailNode}
            title={"Detail"}
            className="c-connect__node-detail"
            onCancel={() => setShowDetailNode(false)}
          >
            <RentedComputeItem
              key={"compute-" + dataMl.id}
              compute_id={dataMl.id}
              datacenter={dataMl.compute_gpu.datacenter}
              location={dataMl.compute_gpu.location_name}
              machine_type="Virtual Machine"
              gpu_tflops={dataMl.compute_gpu.gpu_tflops}
              max_cuda_version={dataMl.compute_gpu.max_cuda_version}
              per_gpu_ram={dataMl.compute_gpu.gpu_memory}
              per_gpu_memory_bandwidth={dataMl.compute_gpu.gpu_memory_bandwidth}
              motherboard={dataMl.compute_gpu.motherboard}
              number_of_pcie_per_gpu={dataMl.compute_gpu.number_of_pcie_per_gpu}
              eff_out_of_total_nu_of_cpu_virtual_cores={dataMl.compute_gpu.eff_out_of_total_nu_of_cpu_virtual_cores}
              eff_out_of_total_system_ram={dataMl.compute_gpu.eff_out_of_total_system_ram}
              internet_down_speed={dataMl.compute_gpu.internet_down_speed}
              internet_up_speed={dataMl.compute_gpu.internet_up_speed}
              name={dataMl.compute_gpu.gpu_name}
              ip={dataMl.compute_gpu.ip_address}
              rentingHours={formatFloat(dayjs().diff(dayjs(dataMl.compute_gpu.start_time), "hour", true))}
              remainingHours={formatFloat(dayjs(dataMl.compute_gpu.end_time).diff(dayjs(), "hour", true))}
              provider_id={dataMl.compute_gpu.owner_id}
              service={dataMl.compute_gpu.service_type}
              cpu={dataMl.compute_gpu.cpu}
              image={dataMl.compute_gpu.image}
              history_id={dataMl.id}
            />
          </Modal>
        </Suspense>
      </div>
      {/*{isShowLogModal && (
        <Modal open={isShowLogModal} onClose={() => setShowLogModal(false)} title="Logs">
          <label>
            <input type="checkbox" onChange={e => scrollToEndRef.current = e.target.checked} /> Auto scroll to end
          </label>
          <pre ref={logRef} style={{ width: 1024, maxWidth: "calc(100vw - 200px)", display: "block", maxHeight: "calc(100vh - 300px)", overflowY: "auto", whiteSpace: "pre-line", padding: 10, border: "solid 1px rgba(0,0,0,.2)", borderRadius: 16 }} />
        </Modal>
      )}*/}
      <Suspense>
        <Modal
          open={showConfig}
          onClose={() => onCloseModelConfig()}
          title="Configure"
          submitText="Save"
          onSubmit={saveConfig}
          className="c-connect__model-config"
        >
          <FormConfig currentConfigTab={currentConfigTab} setConfig={setConfig} config={config} setCurrentConfigTab={setCurrentConfigTab} />
        </Modal>
      </Suspense>
    </>
  );
};

export default ManageConnect;
