import {
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import IconActive from "@/assets/icons/IconActive";
import IconDeActive from "@/assets/icons/IconDeActive";
import IconDownload from "@/assets/icons/IconDownload";
import { BodyUser } from "@/hooks/computes/useCreateUserComputeMkp";
import { useApi } from "@/providers/ApiProvider";
import { useLoader } from "@/providers/LoaderProvider";
import { useMqtt } from "@/providers/MqttProvider";
import Button from "../Button/Button";
import FormBuilder from "../Form/Form";
import "./Index.scss";
import { createAlert } from "@/utils/createAlert";
import { isValidIPv4 } from "@/utils/validators";
import { useDetailComputeByIP } from "@/hooks/computes/userGetDetailComputeByIP";
import { formatBytes } from "@/utils/customFormat";
import countries from "@/pages/ComputesMarketplaceV2/countries.json";
import { confirmDialog, infoDialog } from "../Dialog";
import { useAuth } from "@/providers/AuthProvider";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export type GPU = {
  id: number;
  name: string;
  uuid: string;
  power_consumption: string;
  memory: string;
  serialno: string;
  power_usage: string;
  memory_usage: string;
};

export interface ConvertedGPU {
  infrastructure_id: string | null;
  gpu_name: string;
  power_consumption: string | null;
  gpu_index: number;
  gpu_memory: string | null;
  branch_name: string | null;
  gpu_id: string;
  status: string;
  compute_marketplace: number;
  serialno: string;
  power_usage: string | null;
  memory_usage: string | null;
}

export interface GPUInfo {
  name: string;
  compute_capability: number[];
  cores: number;
  concurrent_threads: number;
  gpu_clock_mhz: number;
  mem_clock_mhz: number;
  memory_bus_width: number;
  mem_bandwidth_gb_per_s: number;
  total_mem_mb: number;
  free_mem_mb: number;
  architecture: string;
  cuda_cores: number;
  tflops: number;
}

export type SERVER_INFORMATION = {
  cpu: string;
  ram: string;
  diskType: string;
  os: string;
};

enum TYPE_MQTT {
  GPU = "GPU",
  SERVER_INFO = "SERVER_INFO",
  DOCKER = "DOCKER",
  KUBERNETES = "KUBER",
  CUDA = "CUDA"
}

type SERVER_MQTT_TYPE = {
  action: string;
  type: TYPE_MQTT;
  data: SERVER_INFORMATION[] | GPU[] | GPUInfo[] | [];
};

type TComputeProps = {
  initData?: Partial<BodyUser>;
  onSetupCompleted?: (
    values: BodyUser,
    gpuData: GPU[],
    serverInfo: SERVER_INFORMATION,
    cuda: GPUInfo[]
  ) => void;
  onIpPortChange?: (ip: string) => void;
  errors?: string;
  formType: "SELF-HOST" | "COMPUTE-MARKET"
};

type TDataSelfHost = BodyUser & {
  compute_gpus?: any
}

const OPERA_SYSTEM = {
  MACOS: "macos",
  WINDOWS: "windows",
  LINUX: "linux",
};

const { MACOS, WINDOWS, LINUX } = OPERA_SYSTEM;
type System = typeof MACOS | typeof WINDOWS | typeof LINUX;
type OperaSystem = {
  system: System;
  command: string;
  binaryLink: string;
};

const IP_NOT_MATCH =
  "You have run the verification file on a compute with a different ip than the one you entered!";

const IP_LOCAL = ["192.168.", "10.", "172.16.", "172.31.", "127.0.0."];

const GET_LINK = `wget ${window.location.origin}/static/computes/aixblock_computes_verification-linux`;
const CHMOD = `sudo chmod +x aixblock_computes_verification-linux`;

const ComputeForm: React.FC<TComputeProps> = ({
  initData,
  onSetupCompleted,
  onIpPortChange,
  errors,
  formType,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<TDataSelfHost>({
    ip_address: "",
    compute_type: "",
    ...initData,
  });
  const api = useApi();
  const { subscribe, onMessage } = useMqtt();
  const [tokenWorker, setTokenWorker] = useState("");
  const [kubernetes, setKubernetes] = useState(false);
  const [docker, setDocker] = useState(false);
  const [canSetup, setCanSetup] = useState(false);
  const [gpu, setGpu] = useState<GPU[] | null>(null);
  const [isGetedGPU, setIsGetedGPU] = useState<boolean>(false);
  const [serverInfo, setServerInfo] = useState({
    cpu: "",
    ram: "",
    diskType: "",
    os: "",
    GPU: [],
  });
  const [activeTab, setActiveTab] = useState<number>(0);
  const [ copiedText, copy ] = useCopyToClipboard();

  const [cuda, setCuda] = useState([]);

  const [waitingVerify, setWaitingVerify] = useState(false);
  const [operaSystem, setOperaSystem] = useState<OperaSystem>({
    system: "linux",
    command: "",
    binaryLink: "",
  });
  const [error, setError] = useState(errors);
  const { waitingForPromise } = useLoader();
  const ip = useRef<string>("");

  // Call api IP Port
  const { mutate } = useDetailComputeByIP({});

  const onSetDataIpPort = (data: any, newIP: string) => {
    setTokenWorker(data.infrastructure_id);
    subscribe(data.infrastructure_id);
    setData(d => ({
      ...d,
      ...data,
    }));
    setWaitingVerify(true);
    onIpPortChange?.(newIP);
  }

  // Set api IP Port -> Form
  const handleIpConfig = useCallback(
    async (e: any) => {
      e.preventDefault();

      const newIP = String(e.target.value).trim();

      if (newIP === ip.current || !isValidIPv4(newIP) || IP_LOCAL.some(ip => newIP.startsWith(ip))) {
        return;
      }

      const data = await mutate({
        ip_address: newIP,
      });

      if (data && data.type === "COMPUTE-SELF-HOST") {
        confirmDialog({
          title: "Info",
          message: "Your computer is being added to self-hosted. If you continue, all your data will be reset.",
          onSubmit: () => onSetDataIpPort(data, newIP),
        });
        return;
      }

      if (data && data.currently_rented && formType === "COMPUTE-MARKET") {
        infoDialog({ message: "This compute is being rented and retrying after the user finishes renting." });
        return;
      }
      
      if (data && (data.owner_id !== user?.id)) {
        infoDialog({ message: "This ip is being self-hosted by another user" });
        return;
      }

      ip.current = newIP;
      const tokenWorker = await api.call("getTokenWorker").promise;
      const secretId = api.call("getSecretId").promise;
      const promisses = Promise.all([tokenWorker, secretId]);
      waitingForPromise(promisses, "Configuring...");
      const [apiTokenGet, apiClientGet] = await promisses;
      const resToken = await apiTokenGet?.json();
      const token = resToken?.token;
      const resClient = await apiClientGet?.json();
      setTokenWorker(token);
      subscribe(token);
      setData(d => ({
        ...d,
        ...data,
        ip_address: newIP,
        infrastructure_id: token,
        client_id: resClient.client_id,
        client_secret: resClient.client_secret,
      }));
      setWaitingVerify(true);
      onIpPortChange?.(newIP);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, api, waitingForPromise, subscribe, onIpPortChange, formType, user?.id]
  );

  const compute_types = useMemo(() => {    
    return {
      label: "Compute Type",
      options: (data && data.compute_gpus && data?.compute_gpus?.length === 0) || (isGetedGPU && (!gpu || gpu.length === 0)) ? [
        { label: "-- Select compute type --", value: "" },
        { label: "Storage", value: "storage" },
        { label: "Model Training", value: "model-training" },
        { label: "Labeling Tool", value: "label-tool" },
      ] : [
        { label: "-- Select compute type --", value: "" },
        { label: "All Services", value: "full" },
        { label: "Storage", value: "storage" },
        { label: "Model Training", value: "model-training" },
        { label: "Labeling Tool", value: "label-tool" },
      ],
    };
  }, [data, gpu, isGetedGPU]);

  const computeFormFields = useMemo(
    () => [
      {
        columnCount: 1,
        fields: [
          {
            type: "input",
            name: "ip_address",
            label: "IP Port Of The Device",
            required: true,
            placeholder: "Enter your ip port",
            value: data.ip_address,
            setErrorChange: {
              error: "Invalid IP Port.",
              condition: (value: string) => !isValidIPv4(value) || IP_LOCAL.some(ip => value.startsWith(ip)),
            },
            onBlur: handleIpConfig,
          },
          {
            type: "select",
            name: "compute_type",
            label: compute_types.label,
            value: data.compute_type,
            options: compute_types.options,
            onChange: async (value: SetStateAction<string>) => {
              setData((data) => ({
                ...data,
                compute_type: value as string,
              }));
            },
          },
          ...initData?.location_id !== undefined ? [{
            type: "select",
            name: "location",
            label: "Location",
            value: data.location_id,
            required: true,
            options: [
              {label: "-- Select location --", value: ""},
              ...countries.map(c => ({
                label: c.name,
                value: c.id.toString(),
              })),
            ],
            onChange: async (value: SetStateAction<string>) => {
              setData((data) => ({
                ...data,
                location_id: value as string,
              }));
            },
            setErrorChange: {
              error: "Select the location of this compute",
              condition: (value: string) => !value,
            },
          }] : [],
          // ...initData?.machine_options !== undefined ? [...Object.keys(MACHINE_TYPES_LIST)
          //   .filter(t => t !== "secure-cloud")
          //   .map(t => {
          //     return {
          //       type: "toggle",
          //       name: t,
          //       label: MACHINE_TYPES_LIST[t as keyof typeof MACHINE_TYPES_LIST],
          //       value: data.machine_options?.includes(t) ? 1 : 0,
          //       onChange: (isChecked: SetStateAction<string>) => {
          //         setData((d) => {
          //           if (!d.machine_options) {
          //             return d;
          //           }

          //           let opts = d.machine_options;

          //           if (isChecked === "true") {
          //             if (t === "virtual-machines") {
          //               opts = opts.filter(v => v !== "physical-machines");
          //             } else if (t === "physical-machines") {
          //               opts = opts.filter(v => v !== "virtual-machines");
          //             }
          //           } else {
          //             if (t === "virtual-machines" && !opts.includes("physical-machines")) {
          //               opts.push("physical-machines");
          //             } else if (t === "physical-machines" && !opts.includes("virtual-machines")) {
          //               opts.push("virtual-machines");
          //             }
          //           }

          //           if (isChecked === "true" && !opts.includes(t)) {
          //             opts?.push(t);
          //           }

          //           if (isChecked === "false" && opts.includes(t)) {
          //             opts = opts.filter(v => v !== t);
          //           }

          //           return {...d, machine_options: opts};
          //         });
          //       },
          //     };
          // })] : [],
          {
            type: "input",
            name: "infrastructure_id",
            label: "Token worker",
            placeholder: "Token worker",
            value: data.infrastructure_id || "",
            readonly: true,
          },
          {
            type: "input",
            name: "client_id",
            label: "Client ID",
            placeholder: "Client ID",
            value: data.client_id || "",
            readonly: true,
          },
          {
            type: "input",
            name: "client_secret",
            label: "Client secret",
            placeholder: "Client secret",
            value: data.client_secret || "",
            readonly: true,
          },
        ],
      },
    ],
    [
      data.client_id,
      data.client_secret,
      data.compute_type,
      data.infrastructure_id,
      data.ip_address,
      data.location_id,
      compute_types.label,
      compute_types.options,
      handleIpConfig,
      initData?.location_id,
    ]
  );
  
  const getCommandScript = (system: System, token: string) => {
    // to do get command script
    let command = "";
    let binaryLink = "";
    const commandArgs = token; //window.APP_SETTINGS.mqtt_server + " " +

    switch (system) {
      case "windows":
        command = "aixblock_computes_verification-window.exe " + commandArgs;
        binaryLink =
          "/static/computes/aixblock_computes_verification-window.exe";
        break;
      case "macos":
        command = "./aixblock_computes_verification-macos " + commandArgs;
        binaryLink = "/static/computes/aixblock_computes_verification-macos";
        break;
      case "linux":
        command = "./aixblock_computes_verification-linux " + commandArgs;
        binaryLink = "/static/computes/aixblock_computes_verification-linux";
        break;
      default:
        break;
    }

    setOperaSystem({ system, command, binaryLink });
  };


  const handleMessage = useCallback(
    (msg: object) => {
      const typedMsg = msg as SERVER_MQTT_TYPE;
      if (typedMsg.type === TYPE_MQTT.DOCKER) {
        setDocker(true);
      }
      if (typedMsg.type === TYPE_MQTT.KUBERNETES) {
        setKubernetes(true);
      }

      if (typedMsg.type === TYPE_MQTT.SERVER_INFO) {
        const dataMqtt = typedMsg.data[0] as any;
        setServerInfo({
          ...dataMqtt,
        });
        setError(dataMqtt.ip !== data.ip_address ? IP_NOT_MATCH : "");
        setIsGetedGPU(true);
        // Reset compute type
        setData(c => ({...c, compute_type: ""}));
      }

      if (
        typedMsg.type === TYPE_MQTT.GPU &&
        typedMsg.data &&
        Array.isArray(typedMsg.data) &&
        typedMsg.data.length > 0
      ) {
        setGpu(typedMsg.data as any);
      }

      if (typedMsg.type === TYPE_MQTT.CUDA) {
        const dataMqtt = typedMsg.data as any;
        setCuda(dataMqtt);
      }
    },
    [data]
  );

  useEffect(() => {
  // turn off if enable win, mac
    if (!cuda || !gpu || !serverInfo || !kubernetes || !docker) {
      getCommandScript(LINUX, tokenWorker)

      const unsubsribe = onMessage(tokenWorker, handleMessage);
      return () => unsubsribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenWorker, data, cuda, gpu, serverInfo, kubernetes, docker]);

  const handleSubmitForm = async (_: Record<string, any>) => {
    return false;
  };

  useEffect(() => {
    if (kubernetes && docker) {
      setWaitingVerify(false);
      setCanSetup(true);
    } else {
      setCanSetup(false);
    }
  }, [kubernetes, docker]);

  const errorsNode = useMemo(() => {
    return createAlert(error);
  }, [error]);

  return (
    <div className="compute-form-add-host">
      {errorsNode}
      <div>
        <div className="compute-form-add-host__wrapper">
          <FormBuilder
            onSubmit={handleSubmitForm}
            fields={computeFormFields}
          ></FormBuilder>

          <div className="compute-form-add-host__instruction">
            {!data.ip_address && (
              <div className="compute-form-add-host__instruction__title">
                Download script and run it on your infrastructure:
              </div>
            )}
            <div
              className={`compute-form-add-host__instruction__content ${
                data.ip_address ? "verify" : ""
              }`}
            >
              {data.ip_address && (
                <>
                  <div className="compute-form-add-host__instruction__download">
                    <div className="compute-form-add-host__instruction__download__title">
                      Install instructions
                    </div>
                    <div className="compute-form-add-host__instruction__download__system">
                      {/* <label
                        className={`customcb ${
                          operaSystem?.system === WINDOWS ? "active" : ""
                        }`}
                        // onClick={() => getCommandScript(WINDOWS, tokenWorker)}
                      >
                        Window
                        <input
                          checked={operaSystem?.system === WINDOWS}
                          type="checkbox"
                        />
                        <span className="checkmark"></span>
                      </label>
                      <label
                        className={`customcb ${
                          operaSystem?.system === MACOS ? "active" : ""
                        }`}
                        // onClick={() => getCommandScript(MACOS, tokenWorker)}
                      >
                        Mac
                        <input
                          checked={operaSystem?.system === MACOS}
                          type="checkbox"
                        />
                        <span className="checkmark"></span>
                      </label> */}
                      <label
                        className={`customcb ${operaSystem?.system === LINUX ? "active" : ""
                          }`}
                        onClick={() => getCommandScript(LINUX, tokenWorker)}
                      >
                        Linux
                        <input
                          checked={operaSystem?.system === LINUX}
                          type="checkbox"
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div className="compute-form-add-host__instruction__tabs">
                      <div
                        className={`compute-form-add-host__instruction__tab ${activeTab === 0 && "active"}`}
                        onClick={() => {
                          setActiveTab(0);
                        }}
                      >
                        Get Link
                      </div>
                      <div
                        className={`compute-form-add-host__instruction__tab ${activeTab === 1 && "active"}`}
                        onClick={() => {
                          setActiveTab(1);
                        }}
                      >
                        Download
                      </div>
                      <div className="compute-form-add-host__instruction__tab-space"></div>
                    </div>
                    <div className="compute-form-add-host__instruction__tabs-container">
                      {activeTab === 1 ? (<>
                        {operaSystem.command && (
                          <Fragment>
                            <div className="compute-form-add-host__instruction__download__command get-link">
                              {CHMOD}
                              <Button className="formats__select--copy" onClick={() => copy && copy(CHMOD ?? "")}>
                                {copiedText ? "Copied" : "Copy"}
                              </Button>
                            </div>
                            <div className="compute-form-add-host__instruction__download__command">
                              {operaSystem.command}
                              <Button className="formats__select--copy" onClick={() => copy && copy(operaSystem.command ?? "")}>
                                {copiedText ? "Copied" : "Copy"}
                              </Button>
                            </div>
                            <a
                              className="compute-form-add-host__instruction__download__btn"
                              type="white"
                              href={operaSystem.binaryLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <IconDownload /> Download verification app
                            </a>
                          </Fragment>
                        )}
                        </>) : (
                          <>
                            <div className="compute-form-add-host__instruction__download__command get-link">
                              {GET_LINK}
                              <Button className="formats__select--copy" onClick={() => copy && copy(GET_LINK ?? "")}>
                                {copiedText ? "Copied" : "Copy"}
                              </Button>
                            </div>
                            <div className="compute-form-add-host__instruction__download__command get-link">
                              {CHMOD}
                              <Button className="formats__select--copy" onClick={() => copy && copy(CHMOD ?? "")}>
                                {copiedText ? "Copied" : "Copy"}
                              </Button>
                            </div>
                            <div className="compute-form-add-host__instruction__download__command">
                              {operaSystem.command}
                              <Button className="formats__select--copy" onClick={() => copy && copy(operaSystem.command ?? "")}>
                                {copiedText ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          </>
                        )
                      }
                    </div>
                  </div>
                  <div className="compute-form-add-host__instruction__wrapper">
                    <div className="compute-form-add-host__instruction__info">
                      <span className="compute-form-add-host__instruction__info__title">
                        Server information
                      </span>
                      {Object.entries(serverInfo).map(([key, value], index) => (
                        <span
                          key={index}
                          className="compute-form-add-host__instruction__info__item"
                        >
                          <span>
                            {key.toUpperCase()}:{" "}
                            {key === "ram" || key === "storage"
                              ? formatBytes(Number(value))
                              : Array.isArray(value)
                              ? value.map((item) => (item as { name: string }).name).join(" ")
                              : value}
                          </span>
                        </span>
                      ))}

                      {gpu?.map((obj: GPU, idx: number) => (
                        <span
                          key={idx}
                          className="compute-form-add-host__instruction__info__item"
                        >
                          GPU {idx}: {obj.name} - UUID: {obj.uuid}
                        </span>
                      ))}
                    </div>

                    <div className="compute-form-add-host__instruction__info">
                      <span className="compute-form-add-host__instruction__info__title">
                        Server install
                      </span>
                      {operaSystem?.system !== LINUX && 
                        <span className="compute-form-add-host__instruction__info__item">
                          Kubernetes:
                          <span className="compute-form-add-host__instruction__info__item___action">
                            {kubernetes ? (
                              <IconActive width={18} height={18} />
                            ) : (
                              <IconDeActive width={18} height={18} />
                            )}
                          </span>
                        </span>
                      }
                      <span className="compute-form-add-host__instruction__info__item">
                        Docker:
                        <span className="compute-form-add-host__instruction__info__item___action">
                          {docker ? (
                            <IconActive width={18} height={18} />
                          ) : (
                            <IconDeActive width={18} height={18} />
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="compute-form-add-host__action">
                    <Button
                      className={`compute-form-add-host--next ${
                        waitingVerify && "waitting"
                      }`}
                      size="small"
                      type="primary"
                      onClick={() => {
                        if (canSetup) {
                          const loc = countries.find(c => c.id.toString() === data.location_id);

                          if (loc) {
                            onSetupCompleted?.(data, gpu ?? [], serverInfo, cuda);
                          }
                        }
                      }}
                      disabled={
                        !data.ip_address || !data.location_id || data.compute_type?.length === 0 ||
                        waitingVerify ||
                        error === IP_NOT_MATCH
                      }
                    >
                      {waitingVerify
                        ? "Waiting Verify"
                        : canSetup
                        ? "Setup"
                        : "Verify"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeForm;
