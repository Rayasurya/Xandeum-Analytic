import { useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import {DataSelect} from "@/components/Select/Select";
import useDebouncedEffect from "../../useDebouncedEffect";

interface DataItem {
  id: number;
  name: string;
  version: string;
  project_id: number;
  updated_at: Date;
}



export const useGetDatasetModel = (projectId: string) => {
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DataSelect[]>([]);
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);


  const convertData = (data: DataItem[]): DataSelect[] => {
    const convertedData: DataSelect[] = [];

    data.forEach(item => {
      const existingLabelIndex = convertedData.findIndex(
        convertedItem => convertedItem.label === `Dataset ${item.version}`
      );

      if (existingLabelIndex !== -1) {
        convertedData[existingLabelIndex].options.push({
          label: item.name,
          value: item.id.toString(),
          data: {
            project_id: item.project_id.toString(),
            updated_at: item.updated_at

          }
        });
      } else {
        convertedData.push({
          label: `Dataset  ${item.version}`,
          options: [{ label: item.name, value: item.id.toString(), data: {
            project_id: item.project_id.toString(),
          } }]
        });
      }
    });

    return convertedData;
  };

  useDebouncedEffect(() => {
    setLoading(true);
    const response: TApiCallResult = api.call("getDatasetModelMarketplace", {
      query: new URLSearchParams({
        project_id: projectId,
      })
    });
    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) {
          return;
        }

        const data = await res.json();

        if (data) {
          const convertedData = convertData(data);

          setDataset(convertedData);
        } else {
          setError("Invalid Checkpoint from the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(data);
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading compute gpus.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });
  }, [api, projectId]);

  return useMemo(() => {
    return {
      dataset,
      error,
      loading,
    };
  }, [dataset, error, loading]);
};
