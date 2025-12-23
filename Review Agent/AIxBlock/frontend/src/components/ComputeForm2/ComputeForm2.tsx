import {
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import IconActive from "@/assets/icons/IconActive";
import IconDownload from "@/assets/icons/IconDownload";
import {BodyUser} from "@/hooks/computes/useCreateUserComputeMkp";
import {useApi} from "@/providers/ApiProvider";
import {useLoader} from "@/providers/LoaderProvider";
import Button from "../Button/Button";
import FormBuilder from "../Form/Form";
import "./Index.scss";
import {createAlert} from "@/utils/createAlert";
// import {isValidIPv4} from "@/utils/validators";
import {useDetailComputeByIP} from "@/hooks/computes/userGetDetailComputeByIP";
import {formatBytes} from "@/utils/customFormat";
import countries from "@/pages/ComputesMarketplaceV2/countries.json";
import {useAuth} from "@/providers/AuthProvider";
import {useCopyToClipboard} from "@/hooks/useCopyToClipboard";
import {confirmDialog, infoDialog} from "../Dialog";
import {useNavigate} from "react-router-dom";
import {IconDeActive} from "@/assets/icons/Index";
import Alert from "../Alert/Alert";
import {useCentrifuge} from "@/providers/CentrifugoProvider";
import {GPU_INFO, LABEL_TOOL_INFO, STORAGE_INFO} from "./constants";

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
  CUDA = "CUDA",
  IP = "IP_ADDRESS",
  FAIL ="Fail",
  COMPUTE_TYPE = "COMPUTE_TYPE",
  STAY_ON_FORM = "STAY_ON_FORM",
}

type SERVER_MQTT_TYPE = { type: TYPE_MQTT.DOCKER }
  | { type: TYPE_MQTT.CUDA, data: GPUInfo[] }
  | { type: TYPE_MQTT.SERVER_INFO, data: SERVER_INFORMATION[] }
  | { type: TYPE_MQTT.GPU, data: GPU[] }
  | { type: TYPE_MQTT.IP, data: string }
  | { type: TYPE_MQTT.FAIL, data: string }
  | { type: TYPE_MQTT.COMPUTE_TYPE }
  | { type: TYPE_MQTT.STAY_ON_FORM };

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
  formType: "SELF-HOST" | "COMPUTE-MARKET";
  computeType?: "label-tool" | "storage" | "model-training" | "full";
};

type TDataSelfHost = BodyUser & {
  compute_gpus?: any
}

// const IP_LOCAL = ["192.168.", "10.", "172.16.", "172.31.", "127.0.0."];

export default function ComputeForm2({initData, onSetupCompleted, onIpPortChange, errors, formType, computeType}: TComputeProps) {
  const {user} = useAuth();
  const [data, setData] = useState<TDataSelfHost>({
    ...initData,
    ip_address: "",
    compute_type: computeType,
  });
  const api = useApi();
  const {onMessage, publish} = useCentrifuge();
  const [tokenWorker, setTokenWorker] = useState("");
  const [docker, setDocker] = useState(false);
  const [installError, setInstallError] = useState("");
  const [canSetup, setCanSetup] = useState(false);
  const [gpu, setGpu] = useState<GPU[] | null>(null);
  const [serverInfo, setServerInfo] = useState<SERVER_INFORMATION & {GPU: GPU[]} | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedText, copy] = useCopyToClipboard();
  const [cuda, setCuda] = useState<GPUInfo[]>([]);
  const [waitingVerify, setWaitingVerify] = useState(true);
  const [os, setOs] = useState<"linux" | "windows" | "macos">("linux");
  const [error, setError] = useState(errors);
  const {waitingForPromise} = useLoader();
  const navigate = useNavigate();
  const {mutate} = useDetailComputeByIP({});
  const [needToCreateToken, setNeedToCreateToken] = useState(false);

  useEffect(() => {
    setData(d => ({...d, compute_type: computeType ?? ""}));
  }, [computeType]);

  useEffect(() => {
    if (data.compute_type || data.location_id) {
      const ar = api.call("updateComputeTypeLocation", {
        body: {
          "compute_id": data.compute_id,
          "compute_type": data.compute_type,
          "location_id": data.location_id,
          "location_name": data.location_name,
          "location_alpha2":data.location_alpha2
        },
      });
      ar.promise
        .then(async (r) => {
          if (r.ok) {
           
          } else {
           
          }
        })
        .catch((e) => {

        });
    }
  }, [api, data]);

  useEffect(() => {
    if (formType !== 'COMPUTE-MARKET') {
      const ar = api.call("checkComputeSelfHostWaitVerify");

      ar.promise
        .then(async r => {
          if (r.ok) {
            const rData = await r.json();

            setData(d => ({
              ...d,
              infrastructure_id: rData["infrastructure_id"],
              client_id: rData["client_id"],
              client_secret: rData["client_secret"],
              compute_id: rData["id"].toString(),
              // location_id: rData["location_id"],
              // location_alpha2: rData["location_alpha2"],
              // location_name: rData["location_name"],
              // compute_type: rData["compute_type"],
            }));
            setTokenWorker(rData["infrastructure_id"]);
            return;
          }

          setNeedToCreateToken(true);
        })
    }
    else {
      setNeedToCreateToken(true);

    }
  }, [api, formType]);

  useEffect(() => {
    if (!needToCreateToken) {
      return;
    }

    const tokenAr = api.call("getTokenWorker");
    const secretAr = api.call("getSecretId");
    const arData = {
      infrastructure_id: "",
      client_id: "",
      client_secret: "",
    };

    waitingForPromise(Promise.all([tokenAr.promise, secretAr.promise]), "Configuring...");

    tokenAr.promise
      .then(r => r.json())
      .then(r => {
        if ("token" in r) {
          setData(d => ({...d, infrastructure_id: r.token}));
          setTokenWorker(r.token);
          arData.infrastructure_id = r.token;
          return;
        }

        setError("Can not generate new token");
      })
      .catch(e => {
        setError(e);
      });

    secretAr.promise
      .then(r => r.json())
      .then(r => {
        if ("client_id" in r) {
          setData(d => ({...d, client_id: r.client_id}));
          arData.client_id = r.client_id;
        }

        if ("client_secret" in r) {
          setData(d => ({...d, client_secret: r.client_secret}));
          arData.client_secret = r.client_secret;
        }

        if (!("client_id" in r) || !("client_secret" in r)) {
          setError("Can not generate client credentials...");
        }
      })
      .catch(e => {
        setError(e);
      });

    Promise.all([tokenAr.promise, secretAr.promise])
      .then(() => {
        if (formType !== 'COMPUTE-MARKET' ) {
          setTimeout(async () => {
            try {
              const create = api.call("createComputeSelfHostWaitVerify", {
                body: arData,
              });

              await create.promise;

              const ar = api.call("checkComputeSelfHostWaitVerify");
              const r = await ar.promise;

              if (r.ok) {
                const rData = await r.json();

                setData(d => ({
                  ...d,
                  infrastructure_id: arData["infrastructure_id"],
                  client_id: arData["client_id"],
                  client_secret: arData["client_secret"],
                  compute_id: rData["id"].toString(),
                  // location_id: rData["location_id"],
                  // location_alpha2: rData["location_alpha2"],
                  // location_name: rData["location_name"],
                  // compute_type: rData["compute_type"],
                }));
                setTokenWorker(rData["infrastructure_id"]);
              } else {
                setNeedToCreateToken(true);
              }
            } catch (error) {
              console.error('Error during API calls:', error);
            }
          }, 500);
        }
        
      });
  }, [api, waitingForPromise, needToCreateToken, formType]);

  // const compute_types = useMemo(() => {
  //   return {
  //     label: "Compute Type",
  //     options: (data && data.compute_gpus && data.compute_gpus.length > 0) || (gpu && gpu.length > 0)
  //       ? [
  //         {label: "-- Select compute type --", value: ""},
  //         {label: "All Services", value: "full"},
  //         {label: "Model Training", value: "model-training" },
  //         {label: "Storage", value: "storage"},
  //         {label: "Labeling Tool", value: "label-tool"},
  //       ]
  //       : [
  //         {label: "-- Select compute type --", value: ""},
  //         {label: "Model Training", value: "model-training" },
  //         {label: "Storage", value: "storage"},
  //         {label: "Labeling Tool", value: "label-tool"},
  //       ],
  //   };
  // }, [data, gpu]);

  const computeFormFields = useMemo(
    () => [
      {
        columnCount: 1,
        fields: [
          // {
          //   type: "input",
          //   name: "ip_address",
          //   label: "IP Port Of The Machine",
          //   // required: true,
          //   placeholder: "Will be filled automatically",
          //   value: data.ip_address,
          //   readonly: true,
          //   setErrorChange: {
          //     error: "Invalid IP Port.",
          //     condition: (value: string) => !isValidIPv4(value) || IP_LOCAL.some(ip => value.startsWith(ip)),
          //   },
          // },
          // {
          //   type: "select",
          //   name: "compute_type",
          //   label: compute_types.label,
          //   value: data.compute_type,
          //   options: compute_types.options,
          //   onChange: async (value: SetStateAction<string>) => {
          //     setData((data) => ({
          //       ...data,
          //       compute_type: value as string,
          //     }));
          //   },
          // },
          ...initData?.location_id !== undefined ? [{
            type: "select",
            name: "location",
            label: "Location",
            value: JSON.stringify(countries.find(c => c.id.toString() === data.location_id?.toString())) || "",
            required: true,
            canFilter: true,
            options: [
              { label: "-- Select location --", value: "" },
              ...countries.map(c => ({
                label: c.name,
                value: JSON.stringify(c), // Chuyển đổi đối tượng quốc gia thành chuỗi JSON
              })),
            ],
            onChange: async (value: SetStateAction<string>) => {
              const selectedCountry = JSON.parse(value as string);

              setData((data) => ({
                ...data,
                location_id: selectedCountry.id.toString(),
                location_alpha2: selectedCountry.alpha2,
                location_name: selectedCountry.name,
              }));
            },
            setErrorChange: {
              error: "Select the location of this compute",
              condition: (value: string) => !value,
            },
          }] : [],
        ],
      },
    ],
    [data.location_id, initData?.location_id]
  );

  const checkIP = useCallback((ip: string) => {
    if (ip.trim().length === 0 || tokenWorker.length === 0 || !user?.id) {
      return;
    }

    const promise = mutate({ ip_address: ip });
    waitingForPromise(promise, "Checking your IP address...");

    promise
      .then(data => {
        if (data && data.type === "COMPUTE-SELF-HOST") {
          confirmDialog({
            title: "Warning",
            message: "This IP address has already been added to the system. Rerunning the setup will erase all data on this computer. Proceed only if you're sure you want to continue.",
            onSubmit: () => {
              publish(tokenWorker, {action: "", type: "CONFIRM_RESET", data: "yes"}, true);
              return true;
            },
            onCancel: () => {
              publish(tokenWorker, {action: "", type: "CONFIRM_RESET", data: "no"}, true);

              if (computeType === "label-tool") {
                navigate("/infrastructure/platform");
              } else if (computeType === "storage") {
                navigate("/infrastructure/storage/self-host");
              } else if (computeType === "model-training") {
                navigate("/infrastructure/gpu/self-host");
              }
            },
          });
          return;
        }

        if (data && data.currently_rented && formType === "COMPUTE-MARKET") {
          infoDialog({
            message: "Computer unavailable due to rental. Please try again later.",
            onCancel: () => navigate("/infrastructure/compute-listings/"),
          });
          return;
        }

        if (data && (data.owner_id !== user?.id)) {
          infoDialog({
            message: "This IP address has already been associated with another account.",
            onCancel: () => navigate(
              formType === "COMPUTE-MARKET" ? "/infrastructure/compute-listings/" : "/computes/"
            ),
          });
          return;
        }

        if (!data) {
          publish(tokenWorker, {"action": "", "type": "CONFIRM_RESET", "data": "yes"}, true);
        }
      });
  }, [formType, mutate, navigate, publish, tokenWorker, user?.id, waitingForPromise, computeType]);

  const handleMessage = useCallback((msg: object) => {
    const typedMsg = msg as SERVER_MQTT_TYPE;
    if (typedMsg.type === TYPE_MQTT.DOCKER) {
      setDocker(true);
    } else if (typedMsg.type === TYPE_MQTT.SERVER_INFO && Array.isArray(typedMsg.data) && typedMsg.data.length > 0) {
      setServerInfo(() => ({...typedMsg.data[0], GPU: []}));
    } else if (typedMsg.type === TYPE_MQTT.GPU && Array.isArray(typedMsg.data) && typedMsg.data.length > 0 ) {
      if (formType === 'COMPUTE-MARKET' && typedMsg.data[0].uuid === "") {
        setInstallError('Your compute does not have a GPU. We only provide rentals with machines that have GPUs. Please review your compute and try again later.')
        setCanSetup(false)
      }
      if ( typedMsg.data[0].uuid !== ""){
        setGpu(typedMsg.data);
      }
    } else if (typedMsg.type === TYPE_MQTT.CUDA) {
      setCuda(typedMsg.data);
    } else if (typedMsg.type === TYPE_MQTT.IP) {
      checkIP(typedMsg.data);
      setData(d => ({...d, ip_address: typedMsg.data}));
      if (formType !== 'COMPUTE-MARKET') {
        onIpPortChange?.(typedMsg.data);
      }
    } else if (
      typedMsg.type === TYPE_MQTT.FAIL
    ){
      setInstallError(typedMsg.data)

    } else if (typedMsg.type === "COMPUTE_TYPE") {
      // data: SELF-HOST or COMPUTE-MARKET
      publish(tokenWorker, {"action": "", "type": "COMPUTE_TYPE_RESULT", "data": formType}, true)
    } else if (typedMsg.type === "STAY_ON_FORM") {
      publish(tokenWorker, {"action": "", "type": "STAY_ON_FORM_RESULT", "data": true}, true)
    }
  }, [checkIP, formType, onIpPortChange, publish, tokenWorker]);

  useEffect(() => {
    const unsubsribe = onMessage(tokenWorker, handleMessage, true);
    return () => unsubsribe();
  }, [tokenWorker, onMessage, handleMessage]);

  useEffect(() => {
    if (docker) {
      setWaitingVerify(false);
      setCanSetup(true);
    } else {
      setCanSetup(false);
    }
  }, [docker]);

  const errorsNode = useMemo(() => {
    return createAlert(error);
  }, [error]);

  const verifyCommand = useMemo(() => {
    if (tokenWorker.length === 0) {
      return {auto: "", manual: ""};
    }

    if (os === "linux") {
      const fileName = `aixblock_computes_verification-linux__${tokenWorker}`;
      return {
        auto: `wget -O ${fileName} ${window.location.origin}/static/computes/aixblock_computes_verification-linux`
          + ` && sudo chmod +x ${fileName}`
          + ` && sudo ./${fileName}`,
        manual: `sudo chmod +x ${fileName} && sudo ./${fileName}`,
      };
    }

    return {auto: "Not supported", manual: "Not supported"};
  }, [os, tokenWorker]);

  return (
    <div className="compute-form-add-host">
      {errorsNode}
      <div>
        <div className="compute-form-add-host__wrapper">
          <FormBuilder
            onSubmit={() => false}
            fields={computeFormFields}
          >
            {serverInfo || gpu
              ? (
                <div className="compute-form-add-host__instruction__info">
                  <span className="compute-form-add-host__instruction__info__title">
                    Server information
                  </span>
                  {serverInfo && Object.entries(serverInfo).map(([key, value], index) => (
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
                    <span key={idx} className="compute-form-add-host__instruction__info__item">
                      - #{idx + 1}: {obj.name} - UUID: {obj.uuid}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="compute-form-add-host__additional-info">
                  {computeType === "label-tool" && LABEL_TOOL_INFO}
                  {computeType === "storage" && STORAGE_INFO}
                  {computeType === "model-training" && GPU_INFO}
                </div>
              )
            }
          </FormBuilder>

          <div className="compute-form-add-host__instruction">
            {!data.ip_address && (
              <div className="compute-form-add-host__instruction__title">
                Download script and run it on your infrastructure:
              </div>
            )}
            <div
              className="compute-form-add-host__instruction__content verify"
            >
              <div className="compute-form-add-host__instruction__download">
                <div className="compute-form-add-host__instruction__download__title">
                  Install instructions
                </div>
                <div className="compute-form-add-host__instruction__download__system">
                  <label
                    className={`customcb ${os === "linux" ? "active" : ""}`}
                    onClick={() => setOs("linux")}
                  >
                    Linux
                    <input checked={os === "linux"} type="checkbox" />
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
                    Option 1: Auto
                  </div>
                  <div
                    className={`compute-form-add-host__instruction__tab ${activeTab === 1 && "active"}`}
                    onClick={() => {
                      setActiveTab(1);
                    }}
                  >
                    Option 2: Manual
                  </div>
                  <div className="compute-form-add-host__instruction__tab-space"></div>
                </div>
                <div className="compute-form-add-host__instruction__tabs-container">
                  {activeTab === 1 ? (<>
                    {os === "linux" && (
                      <Fragment>
                        <div className="compute-form-add-host__instruction__tabs-text">
                          1. Download this binary file and transfer it to your machine:
                        </div>
                        <a
                          className="compute-form-add-host__instruction__download__btn"
                          type="white"
                          href={window.location.origin + "/api/compute_marketplace/download/" + tokenWorker + "/"}
                          target="_blank"
                          rel="noreferrer"
                          style={{marginTop: 16}}
                        >
                          <IconDownload/> Download verification app
                        </a>
                        <div className="compute-form-add-host__instruction__tabs-text">
                          2. On your computer, open the terminal and navigate to the directory that contains the transfered file.
                        </div>
                        <div className="compute-form-add-host__instruction__tabs-text">
                          3. Run command:
                        </div>
                        <div className="compute-form-add-host__instruction__download__command get-link">
                          {verifyCommand.manual}
                          <Button className="formats__select--copy"
                                  onClick={() => copy && copy(verifyCommand.manual ?? "")}>
                            {copiedText ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </Fragment>
                      )}
                  </>) : (<>
                    {os === "linux" && (
                      <>
                        <div className="compute-form-add-host__instruction__tabs-text">
                          1. Open the terminal of your machine.
                        </div>
                        <div className="compute-form-add-host__instruction__tabs-text">
                          2. Run command:
                        </div>
                        <div className="compute-form-add-host__instruction__download__command get-link">
                          {verifyCommand.auto}
                          <Button className="formats__select--copy" onClick={() => copy && copy(verifyCommand.auto)}>
                            {copiedText ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </>
                    )}
                  </>)}
                </div>
              </div>
              <div className="compute-form-add-host__instruction__wrapper">
                {data.ip_address.length > 0 && (
                  <div className="compute-form-add-host__instruction__info">
                    {!docker && !installError && (
                      <Alert
                        type="Warning"
                        style={{marginTop: 16, marginBottom: 24, marginRight: 16}}
                        // message="Install Docker and re-run verification to start setup."
                        message="Installing Docker"
                      />
                    )}
                    {
                      installError && (
                        <Alert
                          type="Danger"
                          style={{ marginTop: 16, marginBottom: 24, marginRight: 16 }}
                          message={installError}
                        />
                      )
                    }
                    <span className="compute-form-add-host__instruction__info__title">
                      Server install
                    </span>
                    <span className="compute-form-add-host__instruction__info__item">
                      Docker:
                      <span className="compute-form-add-host__instruction__info__item___action">
                        {docker ? <IconActive width={18} height={18}/> : <IconDeActive width={18} height={18} />}
                      </span>
                    </span>
                    <span className="compute-form-add-host__instruction__info__item">
                      NVIDIA container toolkit:
                      <span className="compute-form-add-host__instruction__info__item___action">
                        {docker ? <IconActive width={18} height={18} /> : <IconDeActive width={18} height={18} />}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="compute-form-add-host__action">
                <Button
                  className={`compute-form-add-host--next ${
                    waitingVerify && "waitting"
                  }`}
                  size="small"
                  type="primary"
                  onClick={() => {
                    if (!serverInfo) {
                      infoDialog({title: "Error", message: "No server information found."});
                      return;
                    }

                    // if (canSetup) {
                    //   const loc = countries.find(c => c.id.toString() === data.location_id);
                    //
                    //   if (loc) {
                    //     onSetupCompleted?.(data, gpu ?? [], serverInfo, cuda);
                    //   }
                    // }

                    if (canSetup) {
                      onSetupCompleted?.(data, gpu ?? [], serverInfo, cuda);
                    }
                  }}
                  disabled={
                    !data.ip_address || data.compute_type?.length === 0 || waitingVerify || !!installError
                  }
                >
                  {waitingVerify
                    ? "Waiting Verify"
                    : canSetup
                      ? "Setup"
                      : "Verify"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
