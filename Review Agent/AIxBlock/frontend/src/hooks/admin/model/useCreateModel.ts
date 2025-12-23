import { useCallback, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {extractErrorMessage, extractErrorMessageFromResponse} from "@/utils/error";
import { TModelMarketplace } from "@/models/modelMarketplace";
// import useUsers from "../providers/UsersProvider";

export type TCreateModel = {
  id?: number;
  name?: string;
  type?: string;
  price?: number;
  port?: string;
  model_desc?: string;
  ml_id?: number;
  config?: string;
  catalog_id?: number;
  order?: number;
  file?: string | Blob | null;
  infrastructure_id?: string | null;
  image_dockerhub_id?: string | null;
  ip_address?: string | null;
  checkpoint_storage_id?: string | null;
  checkpoint_source?: "GIT" | "HUGGING_FACE" | "ROBOFLOW" | "KAGGLE" | null;
  checkpoint_id?: string | null;
  docker_image?: string | null;
  docker_access_token?: string | null;
  dataset_storage_id?: number;
  model_source?: "GIT" | "DOCKER_HUB" | /*"ROBOFLOW" |*/ "HUGGING_FACE" | "LOCAL" | null;
  model_id?: string | null;
  model_token?: string | null;
  author_id?: number;
  owner_id?: number;
  status?: "created" | "in_marketplace" | "rented_bought" | "completed" | "pending" | "suspend" | "expired" | "failed";
  tasks?: TModelMarketplace["tasks"];
};

export const useCreateModel = (body: TCreateModel, isEdit: boolean) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const api = useApi();

  const onCreate = useCallback(async (finishCallback?: (modelID: number) => Promise<void>) => {
    let response: TApiCallResult;
    let errors: Record<string, string[]> = {};

    if (!body.name || body.name.length === 0) {
      errors["name"] = ["This field may not be blank."];
    }

    if (!body.author_id) {
      errors["author_id"] = ["This field may not be blank."];
    }

    if (!body.owner_id) {
      errors["owner_id"] = ["This field may not be blank."];
    }

    if (!body.type) {
      errors["type"] = ["This field may not be blank."];
    }

    if (!body.status) {
      errors["status"] = ["This field may not be blank."];
    }

    if (
      !body.model_source
      || (body.model_source === "DOCKER_HUB" && (!("docker_image" in body) || body.docker_image?.trim() === ""))
      || (["GIT", "ROBOFLOW", "HUGGING_FACE"].includes(body.model_source) && (!("model_id" in body) || body.model_id?.trim() === ""))
      || (body.model_source === "LOCAL" && !body.file)
    ) {
      errors["model_source"] = ["Specify the model source."];
    }

    if (Object.keys(errors).length > 0) {
      errors["system"] = ["Please provide missing information"];
      setError(errors);
      return;
    }

    setLoading(true);

    // if (!body.port) {
    //   setError({ port: ["This field may not be blank."] });
    //   setLoading(false);
    //   return;
    // }

    if (isEdit) {
      response = api.call("updateModel", {
        params: { id: String(body.id) },
        body,
      });
    } else {
      response = api.call("createModel", { body });
    }

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) return;
        const data = await res.clone().json();

        if (res.ok) {
          await finishCallback?.(isEdit ? body.id : data["id"]);
          setIsCreated(true);
          setError(null);
          return;
        }

        if ("validation_errors" in data) {
          setError(data.validation_errors);
        } else {
          setError({ system: [await extractErrorMessageFromResponse(res)]})
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        setError({ system: ["An error occurred while loading create user. " + extractErrorMessage(e)] });

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });
  }, [api, body, isEdit]);

  return useMemo(() => {
    return {
      loading,
      error,
      isCreated,
      onCreate,
    };
  }, [loading, error, isCreated, onCreate]);
};
