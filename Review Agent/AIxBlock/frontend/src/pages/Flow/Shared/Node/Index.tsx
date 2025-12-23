// import { Centrifuge } from 'centrifuge';
import dayjs from "dayjs";
import React, { Suspense, useCallback, useEffect, useMemo, /*useRef,*/ useState } from "react";
import IconMlReset from "@/assets/icons/IconMlReset";
import { IconMinus, IconMl, IconMlStart, IconMlStop, IconPlay, IconPlus, IconStopPlay, IconThreeDot } from "@/assets/icons/Index";
import AppLoading from "@/components/AppLoading/AppLoading";
import Button from "@/components/Button/Button";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import Dropdown from "@/components/Dropdown/Dropdown";
import DropdownItem, { TDropdownItem } from "@/components/DropdownItem/DropdownItem";
import Modal from "@/components/Modal/Modal";
import Spin from "@/components/Spin/Spin";
import { TComputeGPU } from "@/hooks/computes/useRentedGpu";
import { useUpdateStartStopDockerML } from "@/hooks/settings/ml/useStartStopDockerML";
import { TMLBackend } from "@/models/mlBackend";
import { useApi } from "@/providers/ApiProvider";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import { convertFLOP, formatFloat } from "@/utils/customFormat";
import RentedComputeItem from "../CPU/RentedComputeItem";
import styles from "./Node.module.scss";
import {randomString} from "@/utils/random";
import {Tooltip} from "react-tooltip";
import FormConfig from "./FormConfig/Index";
import {TProjectModel} from "@/models/project";
import {TUseProjectHook} from "@/hooks/project/useProjectHook";
// import { toastError } from "@/utils/toast";

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
  project: TProjectModel;
  netWorkId?: number | undefined;
  patchProject: TUseProjectHook["patchProject"];
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
  general = "general",
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

export type TTrainingConfig = Pick<TProjectModel,
  | "epochs" | "batch_size" | "steps_per_epochs"
  | "image_height" | "image_width"
  | "asr_frequency" | "asr_mono"
  | "llm_token"
  | "video_fps" | "video_quality"
>;

const NodeML: React.FC<IManageProps> = ({
  data,
  onDeleted,
  refresh,
  hasMaster,
  openDashboard,
  // centrifugeToken,
  isMasterNode,
  isNetWorkDisconnected,
  project,
  netWorkId,
  proxyUrl,
  patchProject,
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
  const [currentConfigTab, setCurrentConfigTab] = useState<CONFIG_TYPE>(CONFIG_TYPE.general);
  const projectID = useMemo(() => project?.id ? project?.id : 0, [project?.id]);
  const [trainingConfig, setTrainingConfig] = useState<TTrainingConfig>({
    epochs: 10,
    batch_size: 10,
    steps_per_epochs: 2,
    image_width: 213,
    image_height: 213,
    asr_frequency: 48000,
    asr_mono: true,
    llm_token: 4096,
    video_fps: 24,
    video_quality: 320,
  });

  const onCloseModelConfig = () => {
    setShowConfig(false);
    setConfig(initConfigs);
  }

  // useEffect(() => {
  //   let channel_ml = "training_logs"
  //   if (dataMl.id.toString()) {
  //     channel_ml = 'ml_logs_' + dataMl.id.toString()
  //   }
  //   if (isShowLogModal) {
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
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Connected to logger transporter\n";
  //       }
  //     });
  //
  //     centrifuge.on('connecting' as any, function (context: any) {
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Connecting...\n";
  //       }
  //     });
  //
  //     centrifuge.on('disconnected' as any, function (context: any) {
  //       if (logRef.current) {
  //         logRef.current.innerHTML += "Disconnected\n";
  //       }
  //     });
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
  //         logRef.current.scrollTo({ top: logRef.current.scrollHeight });
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
          infoDialog({ message: "Server error: " + data["detail"] });
        } else {
          infoDialog({
            message: "An error ocurred (" + res.statusText + "). Please try again!",
          });
        }

        return;
      }

      // WTH, set prop?
      //
      // if (dataMl.status === MLStatus.MASTER) {
      //   hasMaster = false
      // }

      if (needToRefresh) {
        await refreshBackendInformation();
      }
    } catch (error) {
      if (error instanceof Error) {
        infoDialog({ message: error.message });
      } else {
        infoDialog({ message: `An error occurred while ${action}. Please try again!` });
      }
    }
  }, [onUpdateStartStop, dataMl.id, refreshBackendInformation]);

  const deleteContainer = useCallback(async () => {
    controlDockerContainer(ActionML.DELETE.toLowerCase())
      .then(() => {
        const ar = api.call("delMLBackend", {
          params: { id: dataMl.id.toString() },
        });
        addPromise(ar.promise, "Deleting ML backend...");
        ar.promise.finally(() => onDeleted?.());
      })
      .catch((error) => {
        if (error instanceof Error) {
          infoDialog({ message: error.message });
        } else {
          infoDialog({ message: `An error occurred while delete. Please try again!` })
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
    //     // setShowLogModal(true);
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
        });

        setTrainingConfig({
          epochs: project.epochs ?? 10,
          batch_size: project.batch_size ?? 10,
          steps_per_epochs: project.steps_per_epochs ?? 2,
          image_width: project.image_width ?? 213,
          image_height: project.image_height ?? 213,
          asr_frequency: project.asr_frequency ?? 48000,
          asr_mono: project.asr_mono ?? true,
          llm_token: project.llm_token ?? 4096,
          video_fps: project.video_fps ?? 24,
          video_quality: project.video_quality ?? 320,
        });

        setShowConfig(true);
      },
    },
  ], [deleteContainer, project.epochs, project.batch_size, project.steps_per_epochs, project.image_width, project.image_height, project.asr_frequency, project.asr_mono, project.llm_token, project.video_fps, project.video_quality, dataMl.config]);

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
    // if (!project.checkpoint_storage) {
    //   toastError("Please go to the Settings page to set up your checkpoint storage location first.");
    //   return;
    // }

    setLoading(true);
    const ar = api.call("startTrain", {
      params: { id: dataMl.id.toString() },
      credentials: "include",
    });

    ar.promise.then(async (res) => {
      if (res.ok) {
        refresh?.();
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
    for (let ct in config) {
      for (let i = 0; i < config[ct].arguments.length; i++) {
        if (config[currentConfigTab].arguments[i].name.trim().length === 0) {
          infoDialog({
            title: "Argument error",
            message: `The name of the argument #${i + 1} is empty. Please this argument or give it a name.`,
            className: `${styles.NodeArgsModel}`
          });
          return;
        }
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

    const patchProjectPromise = new Promise((rsl, rjt) => {
      patchProject(trainingConfig, false, () => rsl(void 0), () => rjt(void 0));
    });

    const promises = Promise.all([ar.promise, patchProjectPromise]);
    addPromise(promises, "Updating ML backend config...");

    ar.promise
      .then(r => {
        if (r.ok) {
          setDataMl(ml => ({ ...ml, ...configsBody }));
          return;
        }
      });

    promises
      .then(() => refresh?.())
      .catch(() => setShowConfig(true))
  }, [config, api, dataMl.id, addPromise, currentConfigTab, patchProject, trainingConfig, refresh]);

  const statusNodeClass = useMemo(() => {
    switch (dataMl.status) {
      case "stop":
        return styles.NodeDescStop;
      case "working":
        return styles.NodeDescWorking;
      case "compleated":
        return styles.NodeDescCompleated;
      case "failed":
        return styles.NodeDescFailed;
      case "installing":
        return styles.NodeDescInstalling;
      default:
        return styles.NodeDescNetworkDisconnected;
    }
  }, [dataMl.status]);

  const actionTypeNodeClass = useMemo(() => {
    switch (trainButtonClass) {
      case "stop":
        return styles.NodeClickStop;
      case "start":
        return styles.NodeClickStart;
      case "start-training":
        return styles.NodeClickStartTraining;
      case "stop-training":
        return styles.NodeClickStopTraining;
      case "join-master":
        return styles.NodeClickJoinMaster;
      case "reject-master":
        return styles.NodeClickRejectMaster;
      case "dashboard":
        return styles.NodeClickDashboard;
      case "delete":
        return styles.NodeClickDelete;
      case "cancel":
        return styles.NodeClickCancel;
      default:
        return styles.NodeClickReset;
    }
  }, [trainButtonClass]);

  const nodeId = useMemo(() => "_" + randomString(), []);

  return (
    <>
      <div className={`${styles.Node} ${dataMl.install_status}`}>
        {proxyUrl &&
          <span className="">
            {proxyUrl ? <span className="endpoint"><span>End Point:</span> {proxyUrl}</span> : "End Point: No Proxy URL available"}
          </span>
        }
        <div className={styles.NodeHeader}>
          <div className={`${styles.NodeTitle} ${dataMl.status === MLStatus.MASTER ? "master" : "worker"}`}>
            <div className={`${styles.flex} ${styles.gap4}`}>
              {dataMl.status === MLStatus.MASTER ? "Master Node" : "Worker Node"}
              <Dropdown
                icon={<IconThreeDot />}
                placement="left"
                arrow={true}
              >
                <DropdownItem data={dropdownItems as TDropdownItem[]} />
              </Dropdown>
            </div>
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              (dataMl.status === MLStatus.TRAINING || dataMl.state === MLBackendState.CONNECTED) &&
              <p className={`${styles.NodeDesc} working`}>
                Is working
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              dataMl.state === MLBackendState.DISCONNECTED &&
              <p className={`${styles.NodeDesc} ${statusNodeClass}`}>
                Has stopped working
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              dataMl.status === MLStatus.FINISH &&
              <p className={`${styles.NodeDesc} ${statusNodeClass}`}>
                Finish
              </p>
            }
            {dataMl.install_status !== INTSTALL_STATUS.INSTALLING &&
              <p className={`${styles.NodeDesc} ${dataMl.install_status}`}>
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
                {(dataMl.install_status === INTSTALL_STATUS.FAILED) &&
                  <>
                    <span>Your installation has failed.</span><br />
                    <span>Please click <button>'Reset'</button> to reinstall</span>
                  </>
                }

                {(dataMl.install_status === INTSTALL_STATUS.COMPLEATED && (dataMl.state === "ER" || dataMl.state === MLBackendState.DISCONNECTED)) &&
                  <>
                    <span>Stopped.</span><br />
                    <span>Please click <button>Start</button></span>
                  </>
                }
              </p>
            }
            {dataMl.install_status === INTSTALL_STATUS.INSTALLING &&
              <p className={`${styles.NodeDesc} ${statusNodeClass} ${dataMl.status}`}>
                installing
              </p>
            }
            {dataMl.install_status === INTSTALL_STATUS.RE_INSTALLING &&
              <p className={`${styles.NodeDesc} ${statusNodeClass}`}>
                reinstalling
              </p>
            }
            {isNetWorkDisconnected &&
              <p className={`${styles.NodeDesc} ${styles.NodeDescNetworkDisconnected}`}>
                Network disconnected
              </p>
            }
          </div>
          <div className={styles.NodeAction}>
            {(dataMl.install_status === INTSTALL_STATUS.COMPLEATED || dataMl.install_status === INTSTALL_STATUS.INSTALLING) &&
              <>
                {dataMl.state === MLBackendState.CONNECTED
                  ? (
                    <>
                      {dataMl.install_status !== INTSTALL_STATUS.INSTALLING && <button
                        className={`${styles.NodeActionItem} ${loadingStartStopDocker ? styles.NodeActionItemLoading : ""}`}
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
                          className={`${styles.NodeActionItem} ${loadingStartStopDocker ? styles.NodeActionItemLoading : ""}`}
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
                className={styles.NodeActionItem}
              >
                <IconMlReset />
                <span className={styles.NodeActionItemInfo} id={nodeId}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd"/>
                  </svg>
                </span>
                <Tooltip place="top" positionStrategy="fixed" content="The compute is setting up Docker containers." anchorSelect={"#" + nodeId} />
              </span>) : (
                <button
                  className={`${styles.NodeActionItem} ${isResetLoading ? styles.NodeActionItemLoading : ""}`}
                  onClick={resetContainer}
                  disabled={loadingStartStopDocker || isLoading}
                >
                  {isResetLoading ?
                    <Spin size="md" loading={isResetLoading}/> :
                    <>
                      <IconMlReset/>
                      Reset
                    </>
                  }
                </button>
              )
            }
          </div>
        </div>
        <div className={styles.NodeBody}>
          <div className={styles.NodeBodyItem}>
            <div className={styles.NodeBodyItemIcon}>
              <IconMl />
            </div>
            <div>
              <div className={styles.NodeBodyItemContent}>
                <strong>{dataMl?.compute_gpu.gpu_name}</strong>
              </div>
              <div className={styles.NodeBodyItemContent}>
                <strong>{x}{" "}TFLOPS</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="c-connect__footer">
          <div className={`${styles.NodeActionBetween} ${styles.NodeAction}`}>
            <Button
              size="small"
              className={`${styles.NodeClick} ${actionTypeNodeClass}`}
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
              className={`${styles.NodeClick} ${styles.NodeClickDashboard}`}
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
            className={styles.NodeNodeDetail}
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
          className={styles.NodeModelConfig}
        >
          <FormConfig
            trainingConfig={trainingConfig}
            setTrainingConfig={setTrainingConfig}
            currentConfigTab={currentConfigTab}
            setConfig={setConfig}
            config={config}
            setCurrentConfigTab={setCurrentConfigTab}
            catalogModelKey={project.catalog_model_key ?? "???"}
            dataTypes={project.data_types}
          />
        </Modal>
      </Suspense>
    </>
  );
};

export default NodeML;
