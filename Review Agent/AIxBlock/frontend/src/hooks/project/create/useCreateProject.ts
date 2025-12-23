import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { getPath, isCreateStep } from "@/pages/Project/Settings/LayoutSettings/utils";
import { TProjectModel } from "@/models/project";

export const useCreateProject = (body: Partial<TProjectModel>) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [k: string]: string[];
  }>({});
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatingProject = useMemo(() => isCreateStep(location), [location]);
  const isGeneralStep = getPath(location.pathname, 1) === "general";

  const onCreate = useCallback(async (idParam?: number) => {
    return new Promise<TProjectModel | false>(async (resolve, reject) => {
      let response: TApiCallResult;

      if (body.title?.trim().length === 0) {
        setValidationErrors({"title": ["Project name is required"]});
        resolve(false);
        return;
      }

      if (body.type?.value.length === 0 && !idParam) {
        setValidationErrors({"label_config": ["Type is required"]});
        resolve(false);
        return;
      }

      setLoading(true);

      const payload: Partial<TProjectModel> = {
        ...body,
        epochs: body.epochs ?? 1,
        batch_size: body.batch_size ?? 1,
        image_width: body.image_width ?? 64,
        image_height: body?.image_height ?? 64,
        label_config_title: body.label_config_title ?? "",
      };

      delete payload["created_by"];
      // @ts-ignore
      delete payload["file"];

      if (idParam) {
        response = api.call('updateProject', {
          params: { id: idParam.toString() },
          body: payload,
        });
      } else {
        response = api.call('createProjects', {
          body: payload,
        });
      }

      response.promise
        .then(async res => {
          if (response.controller.signal.aborted) {
            return;
          }

          const data = await res.json();

          if (res.ok) {
            if (isCreatingProject || isGeneralStep) {
              if (!idParam && (body.label_config ?? "").startsWith('<View id="llm-custom"')) {
                navigate("/projects/" + data?.id + `/editor-designer`);
              } else {
                navigate("/projects/" + data?.id + `/settings/ml`);
              }
            }

            setError(null);
            resolve(data);
            return;
          }

          if (Object.hasOwn(data, "validation_errors")) {
            setValidationErrors(data["validation_errors"]);
          }

          if (Object.hasOwn(data, "detail")) {
            setError(data["detail"]);
          }

          resolve(false);
        })
        .catch(e => {
          if (response.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while creating project";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }

          resolve(false);
        })
        .finally(() => {
          if (response.controller.signal.aborted) {
            return;
          }

          setLoading(false);
        });

      await response.promise;
    })
  }, [api, body, isGeneralStep, navigate, isCreatingProject]);

  return useMemo(() => {
    return {
      loading,
      error,
      validationErrors,
      onCreate,
    }
  }, [
    loading,
    error,
    validationErrors,
    onCreate
  ]);
};
