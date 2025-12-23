import InputBase from "../InputBase/InputBase";
import styles from "./Parameters.module.scss";
import {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useApi} from "@/providers/ApiProvider";
import {createAlert} from "@/utils/createAlert";
import {convertFLOP, formatGpuMem} from "@/utils/customFormat";

export type TParametersData = {
  project_id?: string;
  model_id?: string;
  paramaster: string | "check";
  gpu_list_id: string;
}

export type TProps = {
  data: TParametersData;
  onCalculateComputeGpu?: (v: object) => void;
  onParameterChange?: (v: string) => void;
  onLoadingChange?: (v: boolean) => void;
  isProcessing?: boolean;
}

export default function Parameters({data, onCalculateComputeGpu, onParameterChange, onLoadingChange, isProcessing}: TProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [maxParameters, setMaxParameters] = useState<number | "check">("check");
  const [gpuMemory, setGpuMemory] = useState<number>();
  const [tflops, setTflops] = useState<number>();
  const dataRef = useRef<TParametersData>(data);
  const controllerRef = useRef<AbortController>();
  const {call} = useApi();

  const calculate = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort("Data changed");
    }

    if (dataRef.current.gpu_list_id.trim().length === 0) {
      onParameterChange?.("check");
      setMaxParameters("check");
      setTflops(undefined);
      setGpuMemory(undefined);
      return;
    }

    setError(null);
    setIsLoading(true);
    controllerRef.current = new AbortController();

    const ar = call("calculateComputeGpu", {
      query: new URLSearchParams(dataRef.current),
      abortController: controllerRef.current,
    });

    ar.promise
      .then(async r => {
        if (controllerRef.current?.signal.aborted) return;
        const data = await r.json();

        if (!r.ok) {
          if ("detail" in data) {
            setError(data["detail"]);
          } else {
            setError("Error: " + r.statusText + ". Code: " + r.status);
          }

          return;
        }

        onCalculateComputeGpu?.(data);

        if ("paramasters" in data) {
          const newParameters = parseInt(data["paramasters"]);
          onParameterChange?.(newParameters.toString());
          setMaxParameters(Math.max(100, newParameters));
        }

        if ("gpu_memory" in data) {
          setGpuMemory(parseFloat(data["gpu_memory"]));
        }

        if ("tflops" in data) {
          setTflops(parseFloat(data["tflops"]));
        }
      })
      .catch(e => {
        if (controllerRef.current?.signal.aborted) return;
        setError(e.toString());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [call, onCalculateComputeGpu, onParameterChange]);

  const errorNode = useMemo(() => {
    if (!error) {
      return null;
    }

    return createAlert(error, undefined, false, {marginTop: 16});
  }, [error]);

  const tflopsStr = useMemo(() => {
    if (!tflops) {
      return "";
    }

    const r = convertFLOP(tflops);

    if (!r.x || !r.y) {
      return "";
    }

    return r.x + " " + r.y;
  }, [tflops]);

  const gpuMemoryStr = useMemo(() => {
    if (!gpuMemory) {
      return "";
    }

    const r = formatGpuMem(gpuMemory);

    if (!r.x || !r.y) {
      return "";
    }

    return r.x + " " + r.y;
  }, [gpuMemory]);

  const onParameterInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    if (typeof maxParameters !== "number") {
      return;
    }

    const newParams = parseInt(ev.target.value);

    if (isNaN(newParams)) {
      onParameterChange?.("100");
    } else {
      onParameterChange?.(Math.min(Math.max(newParams, 100), maxParameters).toString());
    }
  }, [maxParameters, onParameterChange]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    calculate();
  }, [calculate, data.gpu_list_id]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort("Unmounted");
    }
  }, []);

  return (
    <>
      <div className={styles.container}>
        <InputBase
          label="Params"
          type="number"
          isRequired
          isControlledValue
          disabled={isLoading || data.gpu_list_id.length === 0 || isProcessing}
          value={data.paramaster}
          onChange={onParameterInputChange}
          allowClear={false}
        />
        <InputBase
          label="FLOPs"
          isControlledValue={true}
          readonly={true}
          value={tflopsStr}
          allowClear={false}
          disabled={isProcessing}
        />
        <InputBase
          label="GPU Mem"
          isControlledValue={true}
          readonly={true}
          value={gpuMemoryStr}
          allowClear={false}
          disabled={isProcessing}
        />
      </div>
      {errorNode}
    </>
  );
}
