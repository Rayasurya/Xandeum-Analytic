import { useCallback, useMemo, useState } from "react";
import { DataSelect } from "@/components/Select/Select";
import { useApi } from "@/providers/ApiProvider";
import { randomString } from "@/utils/random";
import useDebouncedEffect from "../../useDebouncedEffect";

type TAnnotationTemplate = {
  author_id: number;
  catalog_key: string;
  catalog_model_id: number;
  config: string;
  created_at: string;
  data_type: string;
  details: string;
  extensions: string;
  group: string;
  id: number;
  image: string;
  infrastructure_id: string;
  ml_image: string;
  ml_ip: string;
  ml_port: string;
  name: string;
  order: number;
  status: boolean;
  updated_at: string;
}

type TConfigList = {[k:number]: string};
type TList = {[k:number]: TAnnotationTemplate};

export const useGetDataTemplatesGpu = () => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<DataSelect[]>([]);
  const [configList, setConfigList] = useState<TConfigList>({});
  const [list, setList] = useState<TList>({});
  const [refreshKey, setRefreshKey] = useState(randomString());

  const refresh = useCallback(() => {
    setRefreshKey(randomString());
  }, []);

  useDebouncedEffect(() => {
    setLoading(true);
    const pmsTemplates = api.call("templates");

    Promise.all([
      pmsTemplates.promise
        .then(async res => {
          if (pmsTemplates.controller.signal.aborted) return;
          const data = await res.json();
          const templatesList: DataSelect[] = [];
          const configList: TConfigList = {};
          const rawList: TList = {};

          for (const groupKey in data.groups) {
            templatesList.push({
              label: data.groups[groupKey],
              options: data.templates
                .map((t: TAnnotationTemplate, index: number) => {
                  if (t.group !== data.groups[groupKey]) {
                    return null;
                  }
                  return {
                    label: t.name,
                    value: t.id,
                  };
                })
                .filter((t2: null) => t2 !== null),
            });
          }

          for (let i = 0; i < data.templates.length; i++) {
            configList[data.templates[i].id] = data.templates[i].config;
            rawList[data.templates[i].id] = data.templates[i];
          }

          setConfigList(configList);
          setTemplates(templatesList);
          setList(rawList);
        })
        .catch(e => {
          if (pmsTemplates.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while loading templates";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }),

    ]).finally(() => {
      if (pmsTemplates.controller.signal.aborted) return;
      setLoading(false);
    });

    return () => {
      pmsTemplates.controller.abort();
    };
  }, [api, error, refreshKey]);

  return useMemo(() => {
    return {
      loading,
      error,
      templates,
      configList,
      refresh,
      list,
    }
  }, [
    loading,
    error,
    templates,
    configList,
    refresh,
    list,
  ]);
};
