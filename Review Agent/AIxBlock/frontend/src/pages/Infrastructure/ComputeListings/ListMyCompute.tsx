import React, {useCallback, useMemo, useState} from "react";
import InputBase from "@/components/InputBase/InputBase";
import "./ListMyCompute.scss";
import {useApi} from "@/providers/ApiProvider";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {DateRangePicker, RangeFocus, RangeKeyDict} from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {useUserLayout} from "@/layouts/UserLayout";
import IconSave from "@/assets/icons/IconSave";
import Modal from "@/components/Modal/Modal";
import IconAlert from "@/assets/icons/IconAlert";
import {infoDialog} from "@/components/Dialog";
import ComputesSupplierStep, {STEP} from "./ComputesSupplierStep";
import {ListCard} from "./ListCard";
import ComputeForm2, {
  ConvertedGPU,
  GPU,
  GPUInfo,
  SERVER_INFORMATION,
} from "@/components/ComputeForm2/ComputeForm2";
import {BodyUser} from "@/hooks/computes/useCreateUserComputeMkp";
import Checkbox from "@/components/Checkbox/Checkbox";
import Alert from "@/components/Alert/Alert";
import {useGetTimeWorking} from "@/hooks/computes/useGetTimeWorking";
import {enUS} from "date-fns/locale";
import {TComputeMarketplace} from "@/models/computeMarketplace";
import {randomString} from "@/utils/random";
import countries from "../../ComputesMarketplaceV2/countries.json";

interface TimeWorking {
  start_time: string;
  end_time: string;
}

const START_DATE = "00:00:00";
const END_DATE = "23:59:59";

const ListMyCompute = () => {
  const api = useApi();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<TComputeMarketplace>();
  const [time, setTime] = useState<TimeWorking>({start_time: "", end_time: ""});
  const {INSTALL, PRICING, AVAILABILITY} = STEP;
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const idCompute = useMemo(() => params["id"], [params]);
  const {setCloseCallback, clearCloseCallback} = useUserLayout();

  React.useEffect(() => {
    setCloseCallback("/infrastructure/compute-listings");
    return () => clearCloseCallback();
  }, [clearCloseCallback, setCloseCallback]);

  const isEdit = useMemo(() => {
    if (!idCompute) {
      return false;
    }

    return !isNaN(parseInt(idCompute));
  }, [idCompute]);

  const [showModalDelete, setShowModalDelete] = useState(false);
  const [computeId, setComputeId] = useState(idCompute);
  const [selectionRange, setSelectionRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
      color: "#fff",
    },
  ]);
  const [focusedRange, setFocusedRange] = useState<RangeFocus>([0, 0]);
  const [isSelectStartDay, setIsSelectStartDay] = useState(false);
  const [isChangeDay, setIsChangeDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[k: string]: string[]}>({});

  useBooleanLoader(loading, "Processing...");

  const getDetailCompute = useCallback(() => {
    const ar = api.call("getComputeDetail", {
      params: {id: computeId?.toString() ?? "0"},
    });

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        setData(data);

        // Further processing if needed
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading columns list.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setLoading(false);
      });
  }, [api, computeId]);

  const step = useMemo(() => searchParams.get("step") ?? INSTALL, [INSTALL, searchParams]);

  const setStep = useCallback((step: string) => {
    searchParams.set("step", step);
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const {
    timeWorking,
    error: timeWorkingError,
    type,
  } = useGetTimeWorking({
    compute_id: step === AVAILABILITY ? computeId : undefined,
  });

  const createCompute = (
    values: BodyUser,
    gpu: GPU[],
    serverInfo: SERVER_INFORMATION,
    cuda: GPUInfo[]
  ) => {
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("ip_address", values.ip_address);
    formData.append("infrastructure_id", values.infrastructure_id || "");
    formData.append("name", values.ip_address);
    formData.append("config", JSON.stringify(serverInfo));
    const ar = api.call("createFull", {
      body: formData,
    });
    ar.promise
      .then(async (r) => {
        if (r.ok) {
          const res = await r.json();
          setComputeId(res.id);
          await createGpuCompute(
            Number(res.id),
            values.infrastructure_id || "",
            gpu,
            cuda,
            values,
          );
        } else {
          const res = await r.json();
          if (Object.hasOwn(res, "message")) {
            setError(res.message);
          } else if (Object.hasOwn(res, "detail")) {
            setError(res.detail);
          } else {
            setError("Can not add compute");
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);

        let msg = "";

        if (e instanceof Error) {
          msg += " " + e.message + ".";
        } else {
          msg = "An error occurred while adding compute.";
        }

        setError(msg + " Please try again!");
      });
  };

  async function createGpuCompute(
    compute_mkp_id: number,
    infrastructure_id: string,
    gpu: GPU[],
    cuda: GPUInfo[],
    values: BodyUser,
  ) {
    const additionalInfo: {[k: string]: string | number | string[]} = {};

    if (values.location_id !== undefined) {
      const loc = countries.find(c => c.id.toString() === values.location_id);

      if (loc) {
        additionalInfo["location_id"] = loc.id;
        additionalInfo["location_alpha2"] = loc.alpha2;
        additionalInfo["location_name"] = loc.name;
      }
    }

    if (values.machine_options !== undefined) {
      additionalInfo["machine_options"] = values.machine_options;
    }

    const convertedGPUList: ConvertedGPU[] = gpu.map((gpu: GPU) => {
      return {
        infrastructure_id: infrastructure_id,
        gpu_name: gpu.name,
        gpu_index: gpu.id,
        gpu_memory: gpu.memory,
        power_consumption: gpu.power_consumption,
        branch_name:
          gpu.name.toLowerCase().indexOf("nvidia") > -1 ? "NVIDIA" : "OTHER",
        gpu_id: gpu.uuid,
        status: "created",
        compute_marketplace: compute_mkp_id,
        serialno: gpu.serialno,
        power_usage: gpu.power_usage,
        memory_usage: gpu.memory_usage,
        ...additionalInfo,
      };
    });

    try {
      const ar = api.call("createBulkComputeGpu", {
        body: {
          compute_gpus: [...convertedGPUList],
          cuda: cuda
        },
      });

      ar.promise
        .then(async (r) => {
          if (r.ok) {
            navigate(`/infrastructure/list-compute/${compute_mkp_id}?step=${PRICING}`);
          } else {
            const res = await r.json();
            if (Object.hasOwn(res, "message")) {
              setError(res.message);
            } else if (Object.hasOwn(res, "detail")) {
              setError(res.detail);
            } else {
              setError("Can not add compute");
            }
          }
        })
        .catch((e) => {
          setLoading(false);

          let msg = "";

          if (e instanceof Error) {
            msg += " " + e.message + ".";
          } else {
            msg = "An error occurred while adding infrastructure.";
          }

          setError(msg + " Please try again!");
        });
    } catch (error) {
      setError("Error while creating GPU computes:" + error);
    }
  }

  const updateTimeWorking = () => {
    try {
      const ar = api.call(
        type === "create"
          ? "createComputeTimeWorking"
          : "updateComputeTimeWorking",
        {
          body: {
            compute_id: Number(computeId),
            infrastructure_id: data?.infrastructure_id,
            time_start: time.start_time || (!isChangeDay ? START_DATE : ""),
            time_end: time.end_time || (!isChangeDay ? END_DATE : ""),
            day_range: isChangeDay
              ? selectionRange.map((s) => ({
                start_day: s.startDate,
                end_day: s.endDate,
              }))
              : [],
            status: "created",
          },
          params: type === "create" ? {} : {id: computeId!},
        }
      );

      ar.promise
        .then(async (r) => {
          if (r.ok) {
            navigate("/infrastructure/compute-listings");
          } else {
            const res = await r.json();
            if (Object.hasOwn(res, "validation_errors")) {
              setValidationErrors(res["validation_errors"]);
            }
            if (Object.hasOwn(res, "message")) {
              setError(res.message);
            } else if (Object.hasOwn(res, "detail")) {
              setError(res.detail);
            } else {
              setError("Failed to add compute");
            }
          }
        })
        .catch((e) => {
          let msg = "";
          if (e instanceof Error) {
            msg += " " + e.message + ".";
          } else {
            msg = "An error occurred while adding infrastructure.";
          }
          setError(msg + " Please try again!");
        });
    } catch (error) {
      setError("Error while creating GPU computes:" + error);
    }
  };

  React.useEffect(() => {
    if (step === PRICING || step === AVAILABILITY) {
      getDetailCompute();
    }
  }, [AVAILABILITY, PRICING, getDetailCompute, step]);

  React.useEffect(() => {
    if (isEdit && step === INSTALL) {
      setStep(PRICING);
    }
  }, [INSTALL, PRICING, isEdit, setStep, step]);

  React.useEffect(() => {
    if (timeWorkingError) {
      setError(timeWorkingError);
    }
  }, [timeWorkingError]);

  React.useEffect(() => {
    if (timeWorking?.day_range?.length) {
      setIsChangeDay(true);
      setSelectionRange(
        timeWorking?.day_range?.map((item, index) => ({
          startDate: item.start_day,
          endDate: item.end_day,
          key: randomString(5),
          color: "#3d91ff",
        })) as any
      );
    }
    setTime({
      start_time: timeWorking?.time_start ?? "",
      end_time: timeWorking?.time_end ?? "",
    });
  }, [timeWorking]);

  const deleteCompute = useCallback(async (id: string) => {
    const isCannotDelete = data?.compute_gpus?.some((c) => c.prices.length);
    if (isCannotDelete) {
      infoDialog({
        message: "Cannot delete compute because this compute is rented.",
      });
      return;
    }
    const ar = api.call("deleteCompute", {
      params: {id},
    });
    const res = await ar.promise;

    if (res.ok) {
      navigate("/infrastructure/compute-listings");
    } else {
      const data = await res.json();
      if (Object.hasOwn(data, "detail")) {
        infoDialog({message: "Server error: " + data["detail"]});
      } else {
        infoDialog({
          message:
            "An error ocurred while delete compute supplier (" +
            res.statusText +
            "). Please try again!",
        });
      }
      return;
    }
  }, [api, data?.compute_gpus, navigate]);

  const handleChangeTime = useCallback((key: string, value: string) => {
    setTime({...time, [key]: value});
  }, [time]);

  const handleChangeAllDay = useCallback((checked: boolean) => {
    setTime({
      start_time: checked ? START_DATE : "",
      end_time: checked ? END_DATE : "",
    });
  }, []);

  const handleChangeDate = useCallback((item: RangeKeyDict) => {
    let selections = [...selectionRange];
    if (!isChangeDay) {
      setIsChangeDay(true);
      selections = [];
    }
    const itemChange = Object.entries(item);
    const valueSelected = itemChange[0][1];
    const indexExistDay = selections.findIndex(
      (s) =>
        new Date(s.startDate).getTime() ===
        new Date(valueSelected.startDate!).getTime()
    );
    // select new range and select start date
    if (indexExistDay === -1 && !isSelectStartDay) {
      selections.push({
        startDate: valueSelected.startDate!,
        endDate: valueSelected.endDate!,
        key: randomString(5),
        color: "#3d91ff",
      });
      setIsSelectStartDay(true);
      setFocusedRange([selections.length - 1, 1]);
    }
    // select end date
    if (isSelectStartDay) {
      selections[indexExistDay] = valueSelected as any;
      setIsSelectStartDay(false);
      setFocusedRange([indexExistDay, 0]);
    }
    // select range exist => remove range exist
    if (indexExistDay !== -1 && !isSelectStartDay) {
      selections.splice(indexExistDay, 1);
      setFocusedRange([0, 0]);
      if (!selections.length) {
        setIsChangeDay(false);
        selections.push({
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
          color: "#fff",
        });
      }
    }
    setSelectionRange(selections);
  }, [isChangeDay, isSelectStartDay, selectionRange]);

  const errorNode = useMemo(() => {
    if (error) {
      return (
        <Alert
          message={error}
          type="Danger"
          style={{marginBottom: 16, marginTop: 16}}
        />
      );
    }
  }, [error]);

  return (
    <div className="c-add-compute-container">
      <div className="c-add-compute-container-step">
        <ComputesSupplierStep step={step}/>
      </div>
      {step === AVAILABILITY ? (
        <>
          <div className="c-add-compute-title">Set up computes</div>
          {errorNode}
          <div className="c-add-compute-content">
            <div className="c-add-compute">
              <div className="c-add-compute__content">
                <form>
                  <InputBase
                    label="IP Port"
                    value={data?.ip_address}
                    disabled
                    allowClear={false}
                  />
                  <InputBase
                    label="Type"
                    value={data?.type}
                    disabled
                    allowClear={false}
                  />
                  <InputBase
                    label="Name"
                    value={data?.name}
                    disabled
                    allowClear={false}
                  />
                </form>
              </div>
            </div>
            <div className="c-add-compute-date">
              <div className="c-add-compute-date-title">
                When will your GPUs/CPUs be available for rental (when your
                device is on but not in use by you)?
              </div>
              <div className="c-add-compute-date-time">
                <DateRangePicker
                  locale={enUS}
                  onChange={handleChangeDate}
                  months={2}
                  ranges={selectionRange as any}
                  onPreviewChange={() => {
                  }}
                  direction="horizontal"
                  focusedRange={focusedRange}
                  minDate={new Date()}
                  className={!isChangeDay ? "default-date" : ""}
                />
                <div className="c-add-compute-date-time-range">
                  <div className="c-add-compute-date-time-range__item">
                    <span
                      className="c-add-compute-date-time-range__item-current"
                      onClick={() =>
                        setTime({
                          ...time,
                          start_time: new Date().toLocaleTimeString(),
                        })
                      }
                    >
                      Set current time
                    </span>
                    <InputBase
                      label="Start time"
                      placeholder="gg:mm:ss"
                      value={time.start_time}
                      allowClear={false}
                      onChange={(e) =>
                        handleChangeTime("start_time", e.target.value)
                      }
                      error={
                        Object.hasOwn(validationErrors, "time_start")
                          ? validationErrors.time_start[0]
                          : null
                      }
                    />
                    <div className="c-add-compute-date-time-range__item-checkbox">
                      <Checkbox
                        label="All day"
                        checked={
                          time.start_time === START_DATE &&
                          time.end_time === END_DATE
                        }
                        onChange={handleChangeAllDay}
                      />
                    </div>
                  </div>
                  <div className="c-add-compute-date-time-range__item">
                    <InputBase
                      label="End time"
                      placeholder="gg:mm:ss"
                      value={time.end_time}
                      allowClear={false}
                      onChange={(e) =>
                        handleChangeTime("end_time", e.target.value)
                      }
                      error={
                        Object.hasOwn(validationErrors, "time_end")
                          ? validationErrors.time_end[0]
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : step === INSTALL ? (
        <div className="c-add-compute-container-add-host">
          <ComputeForm2
            onSetupCompleted={(values, gpuData, serverInfo, cuda) =>
              createCompute(values, gpuData, serverInfo, cuda)
            }
            errors={error}
            initData={{
              machine_options: ["physical-machines"],
              // location_id: "",
            }}
            formType="COMPUTE-MARKET"
            computeType="full"
          />
        </div>
      ) : (
        <ListCard
          data={data}
          infrastructureId={data?.infrastructure_id}
          computeId={computeId}
          setStep={() => {
            setStep(AVAILABILITY);
          }}
        />
      )}
      <div className="c-add-compute-group-btn">
        {step === AVAILABILITY && (
          <>
            {isEdit && (
              <button
                className="delete"
                onClick={() => setShowModalDelete(true)}
              >
                <span>Delete</span>
              </button>
            )}
            <button className="back" onClick={() => setStep(PRICING)}>
              <span>Back</span>
            </button>
            <button className="edit" onClick={updateTimeWorking}>
              <IconSave/>
              <span>Done</span>
            </button>
          </>
        )}
      </div>
      <Modal
        title={
          <>
            <IconAlert/> Are you sure to delete?
          </>
        }
        open={showModalDelete}
        onCancel={() => setShowModalDelete(false)}
        className="computes-delete-modal"
        cancelText="Cancel"
        submitText="Remove"
        onSubmit={() => deleteCompute(idCompute!)}
      >
        <div className="computes-delete-modal-content">
          Everything in Tetrisly contains Auto Layout. Moreover, we’ve redefined
          all variants and we have created brand-new components.
        </div>
      </Modal>
    </div>
  );
};

export default ListMyCompute;
