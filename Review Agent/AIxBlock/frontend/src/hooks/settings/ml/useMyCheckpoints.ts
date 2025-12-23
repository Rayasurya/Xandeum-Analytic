import { useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import {
  TCheckpoint,
  TCheckpointList,
  validateCheckpointModelMarketplace,
} from "@/models/checkpoint";
import { TProjectModel } from "@/models/project";
import { DataSelect } from "@/components/Select/Select";
import useDebouncedEffect from "../../useDebouncedEffect";

type TProps = {
  projects?: TProjectModel[];
  project_id?: string;
  model_id?: string;
  catalog_id?: string;
  ml_id?: string;
};

export const useMyCheckpoints = (props: TProps) => {
  const {
    projects,
    catalog_id = "",
    ml_id = "",
    model_id = "",
    project_id = "",
  } = props;
  const api = useApi();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<DataSelect[]>([]);
  const [listSelectProject, setListSelectProject] = useState<DataSelect[]>([]);

  useDebouncedEffect(() => {
    // use in case call multi api getCheckpointModelMarketplace
    let checkpointList: TCheckpointList = [];

    const fetchData = async ({
      model_id = "",
      project_id = "",
      catalog_id = "",
      ml_id = "",
    }) => {
      setLoading(true);
      const response = api.call("getCheckpointModelMarketplace", {
        query: new URLSearchParams({ project_id, model_id, catalog_id, ml_id }),
      });

      try {
        const res = await response.promise;

        if (response.controller.signal.aborted) return;

        const data = await res.json();
        const vr = validateCheckpointModelMarketplace(data);
        if (vr.isValid) {
          setCheckpoint([
            {
              options: data.map((d: TCheckpoint) => ({
                label: d.name,
                value: d.id?.toString(),
                data: {
                  project_id: d.project_id.toString(),
                },
              })),
            },
          ]);
          checkpointList = [...data];
          setError(null);
        } else {
          setError(
            "Invalid checkpoint list received from the server. Detail: " +
              (vr.errors ?? "")
          );

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      } catch (e) {
        if (response.controller.signal.aborted) return;

        let msg = "An error occurred while loading checkpoint";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      } finally {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      }
    };

    if (projects) {
      const dataListProject: DataSelect[] = [];
      projects.forEach(async (item) => {
        await fetchData({ project_id: item.id.toString() });
        dataListProject.push({
          label: item.title,
          options: checkpointList.map((d: TCheckpoint) => ({
            label: d.name,
            value: d.id!.toString(),
          })),
        });
      });
      setListSelectProject(dataListProject);
    } else {
      fetchData({ project_id, catalog_id, ml_id, model_id });
    }

    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, api]);

  return useMemo(
    () => ({ initialized, loading, error, checkpoint, listSelectProject }),
    [initialized, loading, error, checkpoint, listSelectProject]
  );
};
