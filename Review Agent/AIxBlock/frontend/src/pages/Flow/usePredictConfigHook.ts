import { TProjectModel } from "@/models/project";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { extractErrorMessage } from "@/utils/error";
import { useCentrifuge } from "@/providers/CentrifugoProvider";
import { toastInfo } from "@/utils/toast";
import { hasDebugML } from "@/components/Editor/LSF/LSF";

export type TProps = {
  projectId: number;
  projectPredictConfig: TProjectModel["predict_config"];
  hasMlAssisted: boolean;
  predictTask?: string;
}

export const DEFAULT_PREDICT_PARAMS: Exclude<TProjectModel["predict_config"], undefined | null> = {
  confidenceThreshold: 0.8,
  frame: 25,
  fullVideo: false,
  iouThreshold: 0.8,
  maxGenLength: 50,
  prompt: "",
  seed: 0,
  temperature: 0.9,
  topP: 0.5,
  tokenLength: 1024,
}

export type TPredictParamsKey = keyof typeof DEFAULT_PREDICT_PARAMS;
export type TPredictParamsValue = typeof DEFAULT_PREDICT_PARAMS[TPredictParamsKey];

export default function usePredictConfigHook({
  projectId,
  projectPredictConfig,
  predictTask = "question-answering",
  hasMlAssisted,
}: TProps) {
  const projectIdRef = useRef(projectId);
  const predictConfigRef = useRef<TProjectModel["predict_config"]>({ ...DEFAULT_PREDICT_PARAMS, ...projectPredictConfig });
  const [predictConfig, setPredictConfig] = useState<TProjectModel["predict_config"]>({ ...DEFAULT_PREDICT_PARAMS, ...projectPredictConfig });
  const predictUrlRef = useRef<string | null>(null);
  const [predictUrl, setPredictUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const checkingPredictConfigRef = useRef<boolean>(false);
  const [checkingPredictConfig, setCheckingPredictConfig] = useState<boolean>(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout>();
  const getPredictConfigRef = useRef<(controller?: AbortController) => void>();
  const {call} = useApi();
  const {onMessage, publish} = useCentrifuge();
  const firstTimeRef = useRef(false);

  useEffect(() => {
    const unsub = onMessage("project/" + projectIdRef.current + "/predict_config", (cfg) => {
      if (JSON.stringify(predictConfigRef.current) === JSON.stringify(cfg)) {
        return;
      }

      predictConfigRef.current = cfg as typeof DEFAULT_PREDICT_PARAMS;
      toastInfo("AI Predict config has been updated.", {toastId: "predict-config-updated"});
    });

    return () => {
      unsub();
    };
  }, [onMessage]);

  const getPredictConfig = useCallback((controller?: AbortController) => {
    if (!hasMlAssisted && !hasDebugML()) {
      return;
    }

    clearTimeout(reloadTimeoutRef.current);

    if (hasDebugML()) {
      setCheckingPredictConfig(true);

      reloadTimeoutRef.current = setTimeout(() => {
        if (!window.APP_SETTINGS.debugPredictUrl) {
          return;
        }

        setPredictUrl(window.APP_SETTINGS.debugPredictUrl);
        setLoadError(null);
        setCheckingPredictConfig(false);
      }, 3000);

      return;
    }

    controller = controller ?? new AbortController();
    setCheckingPredictConfig(true);

    const loadFailed = (error?: string) => {
      if (error) {
        window.APP_SETTINGS.debug && console.log(error);

        if (!firstTimeRef.current) {
          setLoadError(error);
        }
      }

      setPredictUrl(null);
      clearTimeout(reloadTimeoutRef.current);

      reloadTimeoutRef.current = setTimeout(() => {
        getPredictConfig();
      }, 10000);
    };

    const ar = call("mlTensorboard", {
      abortController: controller,
      params: {
        project_id: projectIdRef.current.toString(),
      },
    });

    ar.promise
      .then(async r => {
        if (!r.ok) {
          return;
        }

        try {
          const data = await r.json();
          let url: string = data["proxy_url"].trim();

          if (!url.endsWith("/")) {
            url += "/";
          }

          const _predictUrl = url + "action";

          // if (predictConfigRef.current) {
          const r2 = await fetch(url);
          if (ar.controller.signal.aborted) return;

          if (r2.ok) {
            setPredictUrl(_predictUrl);
            setLoadError(null);
            setCheckingPredictConfig(false);
            firstTimeRef.current = false;
            return;
          }
          // } else {
          //   const r2 = await fetch(_predictUrl, {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({
          //       command: "prompt_sample",
          //       params: {
          //         model_id: "",
          //         task: predictTask,
          //       },
          //       project: projectIdRef.current.toString()
          //     }),
          //   });
          //
          //   if (ar.controller.signal.aborted) return;
          //
          //   if (r2.ok) {
          //     const sampleConfig = await r2.json();
          //
          //     if (typeof sampleConfig === "object") {
          //       setPredictUrl(_predictUrl);
          //       setLoadError(null);
          //       setPredictConfig({ ...DEFAULT_PREDICT_PARAMS, ...sampleConfig });
          //       return;
          //     }
          //   }
          // }
        } catch (e) {
          loadFailed("Can not load ML backend. Error: " + extractErrorMessage(e));
          return;
        }

        loadFailed();
      })
      .catch(e => {
        if (ar.controller.signal.aborted) return;
        loadFailed("Can not load ML backend. Error: " + extractErrorMessage(e));
      })
      // .finally(() => {
      //   if (ar.controller.signal.aborted) return;
      //   setCheckingPredictConfig(false);
      // });
  }, [call, hasMlAssisted]);

  useEffect(() => {
    if (JSON.stringify(predictConfigRef.current) === JSON.stringify(predictConfig)) {
      return;
    }

    predictConfigRef.current = predictConfig;
    publish("project/" + projectIdRef.current + "/predict_config", predictConfig as object);
  }, [predictConfig, publish]);

  useEffect(() => {
    predictUrlRef.current = predictUrl;
  }, [predictUrl]);

  useEffect(() => {
    checkingPredictConfigRef.current = checkingPredictConfig;
  }, [checkingPredictConfig]);

  useEffect(() => {
    getPredictConfigRef.current = getPredictConfig;
  }, [getPredictConfig]);

  useEffect(() => {
    return () => {
      clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      getPredictConfig(controller);
    }, 100);

    return () => {
      controller.abort("Unmounted");
      clearTimeout(timeout);
    };
  }, [getPredictConfig]);

  return useMemo(() => ({
    getPredictConfig,
    getPredictConfigRef,
    predictUrl,
    predictUrlRef,
    predictConfig,
    setPredictConfig,
    predictConfigRef,
    loadError,
    checkingPredictConfig,
    checkingPredictConfigRef,
  }), [checkingPredictConfig, getPredictConfig, loadError, predictConfig, predictUrl]);
}
