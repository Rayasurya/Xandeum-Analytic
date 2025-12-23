import React from "react";
import { useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../useDebouncedEffect";


export type TCatalogModel = {
  id: number,
  key: string,
  name: string,
  status: string
}

export type TAnnotation = {
  id: number;
  catalog_model:TCatalogModel;
  name: string;
  group: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  order: number;
  image: string;
  details: string;
  ml_image: string;
  ml_ip: string;
  ml_port: string;
  config: string;
  status: boolean;
  infrastructure_id: string;
  data_type: string;
  extensions: string;
  catalog_model_id: number;
};

export type TModelHook = {
  loading: boolean;
  errorLoading: string | null;
  annotation: TAnnotation | null;
};

/**
 * Fetch a annotation information.
 *
 * @param {number | undefined} id
 */
export default function useGetAnnotationTemplateDetail(id?: string): TModelHook {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errorLoading, setErrorLoading] = React.useState<null | string>(null);
  const [annotation, setAnnotation] = React.useState<TAnnotation | null>(null);
  const api = useApi();

  useDebouncedEffect(() => {
    if (!id || isNaN(Number(id))) {
      return;
    }

    setLoading(true);
    setErrorLoading(null);

    const ar = api.call("annotationTemplate", {
      params: { id },
    });

    ar.promise
      .then(async (r) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        const data = await r.json();
        setAnnotation(data);
      })
      .catch((e) => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading model information.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setErrorLoading(msg + " Please try again!");

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

    return () => {
      ar.controller.abort();
    };
  }, [api, id]);

  return React.useMemo(() => {
    return {
      loading,
      errorLoading,
      annotation,
    };
  }, [loading, errorLoading, annotation]);
}
