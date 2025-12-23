import { TProjectModel } from "@/models/project";
import { TUseProjectHook } from "@/hooks/project/useProjectHook";
import React, { useCallback, useMemo } from "react";
import { useGetExportData } from "@/hooks/project/export/useGetExportData";
import Select, { DataSelect, SelectOption } from "@/components/Select/Select";

type TProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
};

export default function AutoTrain({project, patchProject}: TProps) {
  const {formats, loading} = useGetExportData(project.id);
  const [isChanging, setIsChanging] = React.useState(false);

  const formatOptions: DataSelect[] = useMemo(() => [
    {
      options: (formats ?? []).map(f => ({
        label: f.title,
        value: f.name,
      })),
    }
  ], [formats]);

  const defaultValue = useMemo(() => {
    return formatOptions[0].options.find(o => o.value === project.auto_train_format)
      ?? {label: "- Select format -", value: ""};
  }, [formatOptions, project.auto_train_format]);

  const onFormatChange = useCallback((option: SelectOption) => {
    const val = option.value.length > 0 ? option.value : null;
    setIsChanging(true);

    patchProject({auto_train_format: val}, false, () => {
      setIsChanging(false);
    });
  }, [patchProject]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        Start model training after any annotations are submitted or updated.
        Please choose the format of the data that will be sent to the auto-train process:
      </div>
      <Select
        data={formatOptions}
        defaultValue={defaultValue}
        onChange={onFormatChange}
        isLoading={loading || isChanging}
      />
    </div>
  );
}
