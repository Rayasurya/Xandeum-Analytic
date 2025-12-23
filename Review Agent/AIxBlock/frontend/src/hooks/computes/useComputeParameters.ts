import React from "react";
import {TParametersData} from "@/components/Model/Parameters";
import {TSelectedComputes} from "@/components/ComputeSelect/ComputeSelect";

export type TUseComputeParameters = {
  selectedComputes: TSelectedComputes;
  projectID: string,
}

export default function useComputeParameters({selectedComputes, projectID}: TUseComputeParameters) {
  const [calculatedComputeGpu, setCalculatedComputeGpu] = React.useState<object>({});

  const [paramsData, setParamsData] = React.useState<TParametersData>({
    project_id: projectID,
    paramaster: "check",
    gpu_list_id: "",
  });

  const updateParamsData = React.useCallback(() => {
    const gpu_list_id = selectedComputes.gpus.length === 0 ? "" : selectedComputes.gpus.map(x => x.gpus_id).join(",");

    if (gpu_list_id === paramsData.gpu_list_id) {
      return;
    }

    setParamsData(d => ({
      ...d,
      paramaster: "check",
      gpu_list_id,
    }));
  }, [selectedComputes.gpus, setParamsData, paramsData.gpu_list_id]);

  const onCalculateComputeGpu = React.useCallback((v: object) => {
    setCalculatedComputeGpu(v);
  }, []);

  const onParameterChange = React.useCallback((v: string) => {
    setParamsData(d => ({...d, paramaster: v}));
  }, [setParamsData]);

  React.useEffect(() => {
    updateParamsData();
  }, [selectedComputes, updateParamsData]);

  return {
    calculatedComputeGpu,
    paramsData,
    setParamsData,
    updateParamsData,
    onParameterChange,
    onCalculateComputeGpu,
    setCalculatedComputeGpu,
  }
}
