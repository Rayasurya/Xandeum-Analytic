import { useMemo, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import useDebouncedEffect from "../../useDebouncedEffect";

export type FormatsData = {
  title: string;
  description: string;
  link: string;
  tags: string[];
  name: string;
  disabled: boolean;
}

type ExportFiles = {
  export_files: any[];
}

export const useGetExportData = (id: number) => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<ExportFiles | null>(null);
  const [formats, setFormats] = useState<FormatsData[] | null>(null);

  useDebouncedEffect(() => {
    setLoading(true);
    const files = api.call("previousExports", {
      params: {
        id: id.toString() ?? '',
      },
    });
    const formats = api.call("exportFormats", {
      params: {
        id: id.toString() ?? '',
      },
    });

    Promise.all([
      files.promise
        .then(async res => {
          if (files.controller.signal.aborted) return;
          const result = await res.json();
          if (result) {
            setFiles(result);
          }
        })
        .catch(e => {
          if (files.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while loading previous exports";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }),
      formats.promise
        .then(async res => {
          if (formats.controller.signal.aborted) return;
          const result = await res.json();
          if (result) {
            setFormats(result);
          }
        })
        .catch(e => {
          if (formats.controller.signal.aborted) {
            return;
          }

          let msg = "An error occurred while loading formats exports";

          if (e instanceof Error) {
            msg += " Error: " + e.message + ".";
            setError(msg);
          }

          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }),
    ]).finally(() => {
      if (files.controller.signal.aborted || formats.controller.signal.aborted) return;
      setLoading(false);
    });

    return () => {
      files.controller.abort();
      formats.controller.abort();
    };
  }, [api, error, id]);

  return useMemo(() => {
    return {
      loading,
      error,
      files,
      formats
    }
  }, [
    loading,
    error,
    files,
    formats
  ]);
};
