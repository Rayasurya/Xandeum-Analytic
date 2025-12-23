import React, { ChangeEvent, Fragment, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconAlert from "@/assets/icons/IconAlert";
import IconClearCircle from "@/assets/icons/IconClearCircle";
import IconDeleteComputes from "@/assets/icons/IconDeleteComputes";
import IconSave from "@/assets/icons/IconSave";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import HtmlEditor from "@/components/HtmlEditor/HtmlEditor";
import InputBase from "@/components/InputBase/InputBase";
import Modal from "@/components/Modal/Modal";
import Radio from "@/components/Radio/Radio";
import Select, {
  DataSelect,
  SelectOption,
} from "@/components/Select/Select";
import Upload from "@/components/Upload/Upload";
import { useGetListCatalog } from "@/hooks/computes/useGetListCatalog";
import useGetModelMarketplaceSell from "@/hooks/modelsSeller/useGetModelMarketplaceSell";
// import useProjectsHook from "@/hooks/project/useProjectsHook";
import { useGetListMarketplaceGpus } from "@/hooks/settings/ml/useGetListMarketplaceGpus";
// import { useMyCheckpoints } from "@/hooks/settings/ml/useMyCheckpoints";
import { Gpus } from "@/hooks/settings/ml/useUpdateModelMarketplace";
import { useUserLayout } from "@/layouts/UserLayout";
import { TMarketplaceGpuModel } from "@/models/marketplaceGpu";
import { useApi } from "@/providers/ApiProvider";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import { convertFLOP, formatGpuMem, formatBytes } from "@/utils/customFormat";
import InputRender, { TModelData } from "../../Project/Settings/ML/InputRender/Index";
import { IModelData } from "../../Project/Settings/ML/ModelDetail/Index";
import { TCalculateComputeGpuResponse } from "../../Project/Settings/ML/ModelPreviewNew/Index";
import "./Index.scss";
import IconError from "@/assets/icons/IconError";
import AppLoading from "@/components/AppLoading/AppLoading";
import { Checkpoint, ModelSource } from "../../Project/Settings/ML/helper";
import AutoProvision from "@/components/AutoProvision/AutoProvision";

const adddModelDataDefault = {
  name: "",
  port: null,
  gpus_index: "0",
  docker_image: "",
  docker_access_token: "",
  model_desc: "",
  file: "",
  compute_id: 0,
  computes: [],
  model_source: "",
  model_id: "",
  model_token: "",
  checkpoint_source: "",
  checkpoint_id: "",
  checkpoint_token: "",
  check_sequential_sampling_tasks: false,
  check_random_sampling: false,
  price_per_hours: 0,
  catalog_id: "",
  auto_provision: false,
}

const AddModel = () => {
  const [data, setData] = useState<TModelData>(adddModelDataDefault);
  const api = useApi();
  const [validattionErrors, setValidationErrors] = useState<{
    [k: string]: string[];
  }>({});
  const [selectedGpus, setSelectedGPUs] = useState<Gpus[]>([]);
  const [selectedCpus, setSelectedCpus] = useState<Gpus[] | null>(null);
  const [oldData, setOldData] = React.useState<Gpus[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setError] = useState("");
  const { addPromise } = usePromiseLoader();
  const navigate = useNavigate();
  const userLayout = useUserLayout();
  const { computeId } = useParams();
  const isAdd = computeId === "add";
  const [showModalDelete, setShowModalDelete] = useState(false);
  const { detail, errorLoading } = useGetModelMarketplaceSell(computeId);
  // const { list } = useProjectsHook({ getAll: true });
  // const { listSelectProject } = useMyCheckpoints({
  //   projects: list,
  // });
  const { gpusListModel, loading: gpusLoading } = useGetListMarketplaceGpus();
  const { listData, loading: loadingModelCatalog } = useGetListCatalog({
    type: "model",
  });

  const [epochs, setEpochs] = useState<string>("10");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fps] = useState<string>("");
  const [batchSize, setBatchSize] = useState<string>("12");
  const [batchSizePerEpochs, setBatchSizePerEpochs] = useState<string>("12");
  const [accuracy, setAccuracy] = useState<string>("70");
  const [precision, setPrecision] = useState<string>("fp16");
  const [framework] = useState<string>("pytorch");
  const [sequenceToken, setSequenceToken] = useState<string>("4096");
  const [samplingFrequency, setSamplingFrequency] = useState<string>("48000");
  const [modelSourceType, setModelSourceType] = useState<string | null>(detail?.model_source ?? null);
  const [checkPointType, setCheckPointType] = useState<string | null>(null);
  const [modelType, setModelType] = useState<string | null>(null);
  const [paramsValue, setParamsValue] = useState<number>(0);
  const [mono, setMono] = useState<boolean>(false);
  const [calculateComputeGpu, setCalculateComputeGpu] = useState<TCalculateComputeGpuResponse>();
  const [resolution] = useState<string>("320");
  const [imageSize] = useState<{ width: string; height: string }>({
    width: "213",
    height: "213",
  });
  const [modelData, setModelData] = useState<IModelData>({} as IModelData);
  const isFetchComputes = useRef(false);
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [isInValidModelSource, setIsInValidModelSource] = useState<boolean>(true);
  const [isInValidCheckpoint, setIsInValidCheckpoint] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleFrameworkChange = (option: SelectOption) => {
  //   setFramework(option.value);
  // };

  const gpusIds = selectedGpus.map((item) => ({
    id: item.compute_id,
    val: (item.gpus_id as string).split(","),
  }));

  const computeIds = selectedGpus.map((item) => item.compute_id.toString());

  const computeGpus = gpusListModel?.filter(
    (item) => item.compute_gpus?.length > 0
  );
  const gpusList = computeGpus?.filter((item) =>
    computeIds.includes(item.compute_id.toString())
  );

  const gpusFilter = gpusIds.map((item2) => {
    const correspondingItem1 = gpusList?.find(
      (item1) => item1.compute_id === item2.id
    );
    if (correspondingItem1) {
      const filteredComputeGpus = correspondingItem1.compute_gpus.filter(
        (gpu) => item2.val.includes(gpu.id.toString())
      );
      return {
        compute_gpus: filteredComputeGpus,
      };
    }
    return null;
  });

  const gpuListIds = useMemo(() => {
    return (
      gpusFilter
        ? gpusFilter.flatMap((gpuList) =>
          gpuList ? gpuList.compute_gpus.map((gpu) => gpu.id.toString()) : []
        )
        : []
    ).join(",");
  }, [gpusFilter]);


  const handleMonoChange = (newValue: boolean) => {
    setMono(newValue);
  };

  const handleSamplingFrequencyChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSamplingFrequency(event.target.value);
  };

  const handleSequenceTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSequenceToken(event.target.value);
  };
  const handleEpochsChange = (event: ChangeEvent<HTMLInputElement>) => {
    // setEpochs(event.target.value);
    const value = event.target.value;
    const numberValue = parseInt(value, 10);
    if ((numberValue >= 0 && numberValue <= 1000)) {
      setEpochs(event.target.value);
    }else if(numberValue > 1000){
      setEpochs('1000');
    }
    else {
      setEpochs('1');
    }
  };

  const handleBatchSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numberValue = parseInt(value, 10);
    if ((numberValue >= 0 && numberValue <= 1000)) {
      setBatchSize(event.target.value);
    }else if(numberValue > 1000){
      setBatchSize('1000');
    }
    else {
      setBatchSize('1');
    }
    // setBatchSize(event.target.value);
  };

  const handleBatchSizePerEpochsChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const numberValue = parseInt(value, 10);

    if ((numberValue >= 0 && numberValue <= 1000)) {
      setBatchSizePerEpochs(event.target.value);
    }else if(numberValue > 1000){
      setBatchSizePerEpochs('1000');
    }
    else {
      setBatchSizePerEpochs('1');
    }
  };

  const handleAccuracyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAccuracy(event.target.value);
  };

  // const handlePrecisionChange = (option: SelectOption) => {
  //   setPrecision(option.value);
  // };
  const handlePrecisionChange = (isFP16: boolean) => {
    setPrecision(isFP16 ? "fp16" : "");
  };

  const handleParamsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParamsValue(parseInt(event.target.value));
    isFetchComputes.current = true;
  };

  const fieldsModelSource = useMemo(() => {
    switch (modelSourceType) {
      case "HUGGING_FACE":
        return [
          {
            name: "model_id",
            label: "Model ID",
            placeholder: "Type here",
            isRequired: true,
          },
          {
            name: "model_token",
            label: "Token (If private)",
            placeholder: "Type here",
            isRequired: false,
          },
        ];
      case "ROBOFLOW":
        return [
          {
            name: "model_id",
            label: "Model ID",
            placeholder: "Type here",
            isRequired: true,
          },
          {
            name: "model_token",
            label: "Token",
            placeholder: "Type here",
            isRequired: false,
          },
        ];
      case "GIT":
        return [
          {
            name: "model_id",
            label: "Model URL",
            placeholder: "Type here",
            isRequired: true,
          },
          {
            name: "model_token",
            label: "Token",
            placeholder: "Type here",
            isRequired: false,
          },
        ]
      default:
        return [
          {
            name: "model_id",
            label: "Docker Image",
            placeholder: "Type here",
            isRequired: true,
          },
          {
            name: "model_token",
            label: "Docker Access Token",
            placeholder: "Type number",
            isRequired: false,
          },
        ];
    }
  }, [modelSourceType]);

  const fieldsCheckPoint = useMemo(() => {
    switch (checkPointType) {
      case "HUGGING_FACE":
        return [
          {
            name: "checkpoint_id",
            label: "ID",
            placeholder: "Type here",
            isRequired: gpuListIds?.length > 0,
          },
          {
            name: "checkpoint_token",
            label: "Token (If private)",
            placeholder: "Type here",
            isRequired: false,
          },
        ];
      case "ROBOFLOW":
        return [
          {
            name: "checkpoint_id",
            label: "ID",
            placeholder: "Type here",
            isRequired: gpuListIds?.length > 0,
          },
          {
            name: "checkpoint_token",
            label: "Token",
            placeholder: "Type here",
            isRequired: false,
          },
        ];
      case "GIT":
        return [
          {
            name: "checkpoint_id",
            label: "Checkpoint URL",
            placeholder: "Type here",
            isRequired: gpuListIds?.length > 0,
          },
          {
            name: "checkpoint_token",
            label: "Token",
            placeholder: "Type here",
            isRequired: false,
          },
        ]
      default:
        return [
          {
            name: "checkpoint_id",
            label: "ID",
            placeholder: "Type here",
            isRequired: gpuListIds?.length > 0,
          },
          {
            name: "checkpoint_token",
            label: "Token",
            placeholder: "Type here",
            isRequired: false,
          },
        ]
    }
  }, [checkPointType, gpuListIds?.length]);

  const selectableGpus = useMemo(() => {
    const results: DataSelect[] = gpusListModel.map((j) => {
      const gpus =
        j.compute_gpus?.length > 0
          ? j.compute_gpus.map(
            (c: TMarketplaceGpuModel) =>
            ({
              label: c.gpu_name,
              value: c.id.toString(),
              data: {
                compute_id: j.compute_id,
                gpu: c
              },
            } as SelectOption)
          )
          : [
            {
              label: j?.compute_cpu?.cpu,
              value: "compute_gpus",
              data: {
                compute_id: j.compute_id,
                cpu: j.compute_cpu
              },
            } as SelectOption,
          ];
      return {
        label: j.compute_name,
        options: gpus,
      };
    });
    return results;
  }, [gpusListModel]);

  const getDataGpus = useCallback((data: Gpus[]) => {
    const cpus = data
      .filter((item) => item.gpus_id === "compute_gpus")
      .map(({ compute_id }) => ({ compute_id }));
    const mergedArray = data
      .filter((item) => item.gpus_id !== "compute_gpus")
      .reduce((acc, obj2) => {
        const existingObjIndex = acc.findIndex(
          (obj1) => obj1.compute_id === obj2.compute_id
        );

        if (existingObjIndex !== -1) {
          const gpuIdArray = (acc[existingObjIndex].gpus_id as string).split(
            ","
          );
          if (!gpuIdArray.includes(obj2.gpus_id ?? "")) {
            acc[existingObjIndex].gpus_id += "," + obj2.gpus_id;
          }
        } else {
          acc.push(obj2);
        }
        return acc;
      }, [] as Gpus[]);

    setSelectedCpus(cpus as any);
    setSelectedGPUs(mergedArray as any);
  }, [setSelectedGPUs, setSelectedCpus]);

  const onFieldChange = useCallback(
    async (field: string, value: string | SelectOption[] | number | boolean | File) => {
      const updatedData = {
        ...data,
        [field]: value,
      };
      setData(updatedData);
    },
    [data]
  );

  const onUpload = (file: any) => {
    setData({
      ...data,
      file,
    });
  }

  const clearFile = () => {
    setData((prevData) => ({
      ...prevData,
      file: null,
    }));
  };

  const onSelectGpus = useCallback((result: Gpus[]) => {
    setOldData(result);
  }, []);

  const confirmSelectComputes = () => {
    const isVirtualMachines = oldData.some((item) => item?.machine_options === "virtual-machines");
    const virtualList = data?.computes.filter((i) => i.data.gpu?.machine_options === "virtual-machines");
    const virtuaSelected = virtualList.map((i) => {
      return i.label;
    }).join(" - ");

    if (isVirtualMachines) {
      confirmDialog({
        message: `If you select ${virtuaSelected}, the data will be reset!`,
        onSubmit: () => {
          getDataGpus(oldData);
        },
        onCancel: () => {
          setData({
            ...data,
            computes: data.computes.filter((item) => item.data.gpu?.machine_options !== "virtual-machines")
          });
          setOldData([]);
          return
        }
      });
    } else {
      getDataGpus(oldData);
    }
  }

  async function addModelMarket() {
    setError("");
    setValidationErrors({});
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("docker_image", "");
    formData.append("docker_access_token", "");
    if (data.file) formData.append("file", data.file);

    formData.append(
      "gpus",
      JSON.stringify(
        selectedGpus.map(function (gpu) {
          return {
            compute_id: gpu.compute_id?.toString(),
            gpus_id: gpu.gpus_id?.toString(),
          };
        })
      )
    );

    if (selectedCpus && selectedCpus?.length > 0) {
      formData.append(
        "cpus_ids",
        selectedCpus
          ?.map(function (gpu) {
            return gpu.compute_id.toString();
          })
          .join(",")
      );
    }

    formData.append("model_desc", data.model_desc);
    formData.append("compute_id", data.compute_id + "");
    formData.append("model_info", JSON.stringify(modelData));

    formData.append("model_source", data.model_source);
    formData.append("model_token", data.model_token);
    formData.append("model_id", data.model_id);
    formData.append("checkpoint_source", data.checkpoint_source);
    formData.append("checkpoint_id", data.checkpoint_id);
    formData.append("checkpoint_token", data.checkpoint_token);
    formData.append("check_sequential_sampling_tasks", data.check_sequential_sampling_tasks.toString());
    formData.append("check_random_sampling", data.check_random_sampling.toString());
    formData.append("catalog_id", data.catalog_id ?? "");
    formData.append("price_per_hours", data.price_per_hours?.toString() ?? "");
    formData.append("auto_provision", data.auto_provision?.toString() ?? "");

    const ar = api.call("commercializeModel", {
      body: formData,
    });

    addPromise(ar.promise, "Adding model...");

    ar.promise
      .then(async (r) => {
        if (r.ok) {
          navigate("/models-seller");
        } else {
          const data = await r.json();

          if (Object.hasOwn(data, "validation_errors")) {
            setValidationErrors(data.validation_errors);
          }

          if (Object.hasOwn(data, "detail")) {
            setError(data.detail);
          } else {
            setError(r.statusText);
          }

          if (Object.hasOwn(data, "messages")) {
            infoDialog({ message: "Some thing when wrong!" });
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .finally(() => {
        setSelectedGPUs([]);
        setSelectedCpus([]);
        setData(adddModelDataDefault);
        setParamsValue(0);
        clearFile();
      });
  }

  const editModel = () => {
    api
      .call("updateModelMarketplace", {
        params: { id: computeId! },
        body: {
          ...data,
          port: data.port ? data.port : undefined,
          file: data.file ? data.file : undefined,
        },
      })
      .promise.then(async (res) => {
        if (res.ok) {
          navigate("/models-seller");
        } else {
          const data = await res.json();

          if (Object.hasOwn(data, "validation_errors")) {
            setValidationErrors(data.validation_errors);
          }

          if (Object.hasOwn(data, "detail")) {
            setError(data.detail);
          } else {
            setError(res.statusText);
          }
        }
      });
  };

  React.useEffect(() => {
    errorLoading && setError(errorLoading);
  }, [errorLoading]);

  React.useEffect(() => {
    userLayout.setBreadcrumbs([
      { label: isAdd ? "Commercialize my models" : "Edit Model" },
    ]);
    userLayout.setActions([
      {
        icon: <IconClearCircle />,
        label: "Cancel",
        onClick: () => navigate(`/models-seller`),
        actionType: "danger",
      },
    ]);
    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearActions();
    };
  }, [userLayout, isAdd, navigate]);

  const handleChangeItem = (field: string, value: string | SelectOption[] | number | boolean | File) => {
    setData({ ...data, [field]: value });
  };

  const deleteModel = async (id: string) => {
    const ar = api.call("deleteModel", {
      params: { id },
    });
    const res = await ar.promise;

    if (res.ok) {
      navigate("/models-seller");
    } else {
      const data = await res.json();
      if (Object.hasOwn(data, "detail")) {
        infoDialog({ message: "Server error: " + data["detail"] });
      } else {
        infoDialog({
          message:
            "An error ocurred while delete models seller (" +
            res.statusText +
            "). Please try again!",
        });
      }
      return;
    }
  };

  const modelCatalogList = useMemo(() => {
    let results: DataSelect[] = [];
    if (listData) {
      results = [
        {
          label: "",
          options: listData.map((item) => ({
            label: item.name,
            value: (item.id ?? 1).toString(),
            data: item.key // catalog_key
          })),
        },
      ];
    }
    return results;
  }, [listData]);

  const isAsrType = useMemo(
    () => {
      if (!modelType) return false;
      return modelType === "audio_speech_processing"
    },
    [modelType]
  );

  const isLlmType = useMemo(
    () => {
      if (!modelType) return false;
      return modelType === "generative_ai" || modelType === "llm" || modelType === "nlp"
    },
    [modelType]
  );

  const defaultModelTypeValue = () => {
    return modelCatalogList?.[0]?.options?.find(
      (m) => m.value === (detail?.catalog_id ?? data.catalog_id)?.toString()
    ) ?? { label: "Select", value: "" }
  }

  const defaultModelSource = () => {
    return ModelSource[0].options.find((i) => i.value === (detail?.model_source ?? data.model_source));
  }

  const defaultCheckpoint = () => {
    return Checkpoint[0].options.find((i) => i.value === (detail?.checkpoint_source ?? data.checkpoint_source));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setCheck] = React.useState(false);

  useEffect(() => {
    let controller = new AbortController();

    if (gpuListIds?.length > 0){ //&& paramsValue > 0) {
      const urlSearchParams = new URLSearchParams();
      // if (paramsValue) {
      //   urlSearchParams.append("paramaster", paramsValue.toString());
      // } else {
      //   if(!check){
          urlSearchParams.append("paramaster", "check");
        // }
      // }
      if (data.catalog_id) {
        urlSearchParams.append("catalog_id", data.catalog_id);
      }
      if (gpuListIds?.length > 0) {
        urlSearchParams.append("gpu_list_id", gpuListIds);
      }
      if (framework) {
        urlSearchParams.append("framework", framework);
      }
      if (isLlmType && sequenceToken) {
        urlSearchParams.append("token", sequenceToken);
      }
      if (isAsrType) {
        if (samplingFrequency) {
          urlSearchParams.append("sampling_frequency", samplingFrequency);
        }
        urlSearchParams.append("mono", mono.toString());
      }
      if (epochs) {
        urlSearchParams.append("epochs", epochs);
      }
      if (batchSize) {
        urlSearchParams.append("batch_size", batchSize);
      }
      if (batchSizePerEpochs) {
        urlSearchParams.append("batch_size_per_epochs", batchSizePerEpochs);
      }
      if (accuracy) {
        urlSearchParams.append("accuracy", accuracy);
      }
      if (precision) {
        urlSearchParams.append("precision", precision);
      }

      const ar = api.call("calculateComputeGpu", {
        query: urlSearchParams,
      });

      setCheck(true)
      
      ar.promise
        .then(async (r) => {
          if (controller.signal.aborted) return;

          if (r.ok) {
            const data = await r.json();
            setCalculateComputeGpu(data);
            setParamsValue(data?.paramasters.toString())
            if (!data.can_rent) {
              setIsOpenModalConfirm(true);
              setDisableSubmit(true);
            }
          }
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error(err);
        })
        .finally(() => {
          if (ar.controller.signal.aborted) return;
          isFetchComputes.current = false;
        })

      return () => {
        controller.abort("Params changed");
      };
    }
  }, [
    data.catalog_id,
    accuracy,
    api,
    batchSize,
    batchSizePerEpochs,
    epochs,
    framework,
    gpuListIds,
    isAsrType,
    isLlmType,
    precision,
    samplingFrequency,
    paramsValue,
    sequenceToken,
    mono,
  ]);

  useEffect(() => {
    setModelData((prev: any) => ({
      ...prev,
      token_length: sequenceToken,
      fps: fps,
      accuracy: accuracy,
      sampling_frequency: samplingFrequency,
      mono: mono,
      image_width: imageSize.width,
      image_height: imageSize.height,
      framework: framework,
      resolution: resolution,
      precision: precision,
      // project
      project: {
        ...prev.project,
        epochs: epochs,
        batch_size: batchSize,
        batch_size_per_epochs: batchSizePerEpochs,
      },
      // data FLOPs, MAC, Params
      calculate_compute_gpu: {
        ...prev.calculate_compute_gpu,
        ...calculateComputeGpu,
      },
      // time, cost user want to train
      rent_time: "",
      rent_cost: "",
      estimate_time: "",
      estimate_cost: "",
    }));
  }, [
    mono,
    samplingFrequency,
    framework,
    epochs,
    batchSize,
    batchSizePerEpochs,
    accuracy,
    precision,
    fps,
    imageSize.height,
    imageSize.width,
    resolution,
    sequenceToken,
    calculateComputeGpu?.gpu_memory,
    calculateComputeGpu?.mac,
    calculateComputeGpu?.paramasters,
    calculateComputeGpu?.tflops,
    calculateComputeGpu?.time,
    calculateComputeGpu?.total_cost,
    calculateComputeGpu?.total_power_consumption,
    calculateComputeGpu
  ]);

  const isDisableAddModel = useMemo(() => {
    const isEmpty = (field: any) => field?.length === 0;

    const hasCommonInvalidFields = isEmpty(data.model_source) ||
      isEmpty(data.name) ||
      isEmpty(data.model_desc) ||
      !modelType ||
      disableSubmit;
    
    const hasGpuSpecificInvalidFields = isEmpty(data.checkpoint_source) || isEmpty(data.checkpoint_id) ||
      isEmpty(data.file) || paramsValue === 0;
    const hasInvalidFields = isEmpty(data.model_id);

    if (gpuListIds?.length > 0) {
      return hasCommonInvalidFields || hasGpuSpecificInvalidFields || hasInvalidFields;
    }
    return hasCommonInvalidFields || hasInvalidFields;
  }, [gpuListIds, data, modelType, disableSubmit, paramsValue]);

  const { x, y } = convertFLOP(calculateComputeGpu?.tflops);
  const {x: gpu_mem, y: unit} = formatGpuMem(calculateComputeGpu?.gpu_memory);

  return (
    <div className="c-add-model form">
      <>
        <h4 className="c-add-model__heading">Commercialize my models</h4>
        <div className="content">
          <div className="c-add-model__group">
            <div className="c-add-model__input-column">
              <div className="c-add-model__item__label">
                Name
                <span className="required">*</span>
              </div>
              <InputBase
                placeholder="Type something"
                onChange={(e) => handleChangeItem("name", e.target.value)}
                value={detail?.name ?? data?.name}
                error={
                  Object.hasOwn(validattionErrors, "name")
                    ? validattionErrors["name"][0]
                    : null
                }
                allowClear={false}
              />
            </div>
            <div className="c-add-model__input-column">
              <div className="c-add-model__item__label">
                Model Type
                <span className="required">*</span>
              </div>
              <Select
                defaultValue={defaultModelTypeValue()}
                data={modelCatalogList}
                className="c-ml__select-model"
                onChange={(v) => {
                  setData({ ...data, catalog_id: v.value })
                  setModelType(v.data);
                }}
                isLoading={loadingModelCatalog}
              />
            </div>
          </div>
          <div className="c-add-model__group gray">
            <div className="p-16 full">
              <div className="c-add-model__row justify full mb-24">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Select computes</label>
                  <Select
                    data={selectableGpus}
                    className="c-ml__select-model"
                    isMultiple
                    type="checkbox"
                    onMultipleChange={(opts) => {
                      onFieldChange("computes", opts);
                      onSelectGpus(
                        opts.map((o) => ({ compute_id: o.data.compute_id, gpus_id: o.value, machine_options: o.data.gpu?.machine_options }))
                      )
                    }}
                    isLoading={gpusLoading}
                    customRenderLabel={(item) => {
                      return <div className="c-ml__select-model--select-item">
                        {item.data.cpu ? <>
                          <span>{item.data.cpu.cpu}</span>
                          <span>Ram: {formatBytes(item.data?.cpu?.ram ?? 0)}</span>
                          <span>Disk: {formatBytes(item.data?.cpu?.disk ?? 0)} {item.data?.cpu?.diskType ?? ""}</span>
                        </> : <>
                          <span>{item.data.gpu.gpu_name}</span>
                          {item.data?.gpu?.gpu_memory && (<span>vRam: {formatBytes(item.data?.gpu?.gpu_memory ?? 0) ?? ""}</span>)}
                        </>}
                      </div>
                    }}
                    onClickOutside={confirmSelectComputes}
                    placeholderText={
                      selectableGpus?.length === 0 ? "No computes are avail" : "Please select a compute"
                    }
                    defaultValue={data.computes}
                  />
                </div>
              </div>
              <div className="c-add-model__row justify full mb-24">
                <div className="c-add-model__item" key="params">
                  <span className="c-add-model__item__label">Params:</span>
                  <InputBase
                    isControlledValue={true}
                    value={paramsValue ? paramsValue.toString() : ""}
                    allowClear={false}
                    className="c-model-preview__item__input-number"
                    placeholder="..."
                    type="number"
                    onBlur={handleParamsChange}
                    onChange={handleParamsChange}
                    validateNonNegativeInteger={true}
                  />
                </div>
                <div className="c-add-model__item" key="flops">
                  <span className="c-add-model__item__label">FLOPs:</span>
                  <div className="c-add-model__item__input-number h-40 lead-40">
                    {/* {(gpuListIds.length > 0 && paramsValue > 0 && x) && <span>{x}</span>} */}
                    {(gpuListIds.length > 0) && <span>{x}</span>}
                  </div>
                  <span className="available ">{y}</span>
                </div>
                <div className="c-add-model__item" key="gpu-mem">
                  <span className="c-add-model__item__label">GPU Mem:</span>
                  <div className="c-add-model__item__input-number h-40 lead-40 w-107"><span>{gpu_mem}</span>
                    {/* <span>
                      {
                        (
                          (gpusFilter && gpusFilter?.length > 0 && calculateComputeGpu && calculateComputeGpu?.gpu_memory > 0)) && (
                          <>
                            {calculateComputeGpu && (
                              <div className="c-model-preview__group__detail" key={`key-gpu`}>
                                {(gpuListIds.length > 0 && paramsValue > 0 && gpu_mem) && gpu_mem}
                                {(gpuListIds.length > 0 )}
                              </div>
                            )}
                          </>
                        )
                      }
                    </span> */}
                  </div>
                  <span className="available">{unit}</span>
                </div>
              </div>
              <div className="c-add-model__row">
                {/*<div className="auto-provision">
                  <Fragment>
                    <span
                      data-tooltip-id={"auto-provision"}
                      data-tooltip-place="top-start"
                      data-tooltip-position-strategy="fixed"
                      data-tooltip-content="Enable this button for auto-scaling computing resources based on your model’s needs. Set your preferences and deposit a minimum of 50 USD in AxB tokens to activate, with the flexibility to withdraw anytime if unused."
                    >
                      <IconInfoV2 />
                    </span>
                  </Fragment>
                  <span className="auto-provision__title">Auto Provision</span>
                  <Switch
                    checked={autoProvision}
                    onChange={(isChecked) => {
                      handleChangeItem("name", isChecked);
                      setAutoProvision(isChecked);
                      handleSwitchAutoProvision(isChecked);
                    }}
                  />
                </div>*/}
                <AutoProvision />
              </div>
            </div>
          </div>
          <div className="c-add-model__group">
            <div className="c-add-model__group gray mb-0">
              <div className="p-16 full">
                <div className="c-add-model__row justify">
                  <div className="c-add-model__input-column">
                    <InputRender
                      title="Model Source"
                      setType={setModelSourceType}
                      fields={fieldsModelSource}
                      onFieldChange={handleChangeItem}
                      dataSelect={ModelSource}
                      type={"model_source"}
                      addModelData={detail ?? data}
                      setAddModelData={setData}
                      currentField={detail?.model_source ?? modelSourceType}
                      isRequired={true}
                      defaultValue={defaultModelSource()}
                      setIsInValid={setIsInValidModelSource}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="c-add-model__group gray mb-0">
              <div className="p-16 full">
                <div className="c-add-model__row justify">
                  <div className="c-add-model__input-column">
                    <InputRender
                      title="Checkpoint"
                      setType={setCheckPointType}
                      fields={fieldsCheckPoint}
                      onFieldChange={handleChangeItem}
                      dataSelect={Checkpoint}
                      type={"checkpoint_source"}
                      addModelData={detail ?? data}
                      setAddModelData={setData}
                      currentField={checkPointType}
                      isRequired={gpuListIds?.length > 0}
                      defaultValue={defaultCheckpoint()}
                      setIsInValid={setIsInValidCheckpoint}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="c-add-model__group">
            <div className="p-16 full">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">
                  Upload your sample dataset to have a trial training
                  {gpuListIds?.length > 0 && <span className="required">*</span>}
                </label>
                <Upload
                  name="csv_file"
                  describe="sample dataset for trial"
                  onUpload={onUpload}
                  clearFile={clearFile}
                  accept={".zip,.zar,application/zip,application/x-zip-compressed,application/octet-stream"}
                />
              </div>
            </div>
          </div>
          {(isLlmType || isAsrType) &&
            <div className="c-add-model__group">
              {isLlmType &&
                <InputBase
                  label="Sequence token length"
                  value={sequenceToken}
                  allowClear={false}
                  className="percents__item__input-number"
                  placeholder="Enter token length"
                  type="number"
                  onBlur={handleSequenceTokenChange}
                  validateNonNegativeInteger={true}
                />
              }
              <div className="flex item-center gap-24">
                {isAsrType &&
                  <>
                    <InputBase
                      label="Sampling frequency"
                      value={samplingFrequency}
                      allowClear={false}
                      className="c-percents__item-input"
                      placeholder="Sampling frequency"
                      type="number"
                      onBlur={handleSamplingFrequencyChange}
                      validateNonNegativeInteger={true}
                    />
                    <div className="group mono w-50-12 flex flex-col gap-4">
                      <label className="c-add-model__item__label">Mono:</label>
                      <div className="flex item-center gap-16 h-40">
                        <Radio label="True" checked={mono}
                          onChange={(value) => handleMonoChange(value)}
                        />
                        <Radio label="False"
                          checked={!mono}
                          onChange={(value) => handleMonoChange(!value)}
                        />
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>
          }
          {/* <div className="c-add-model__group">
            <div className="p-16 full">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Framework: </label>
                <Select
                  className={"c-model-preview__select"}
                  defaultValue={{ label: framework, value: framework }}
                  data={dataFramework}
                  onChange={handleFrameworkChange}
                />
              </div>
            </div>
          </div> */}
          <div className="c-add-model__group gray">
            <div className="p-16 full">
              <div className="c-add-model__row justify mb-24">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Epochs:</label>
                  <InputBase
                    value={epochs}
                    allowClear={false}
                    className=""
                    placeholder="Enter epochs"
                    type="number"
                    onBlur={handleEpochsChange}
                    onChange={handleEpochsChange}
                  />
                </div>
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Batch Size:</label>
                  <InputBase
                    value={batchSize}
                    allowClear={false}
                    className=""
                    placeholder="Enter batch size"
                    type="number"
                    onBlur={handleBatchSizeChange}
                    onChange={handleBatchSizeChange}
                  />
                </div>
              </div>
              <div className="c-add-model__row justify mb-24">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Batch size per Epochs:</label>
                  <InputBase
                    value={batchSizePerEpochs}
                    allowClear={false}
                    className={"c-model-preview__item__input"}
                    placeholder="Enter Batch size per epochs"
                    type="number"
                    onBlur={handleBatchSizePerEpochsChange}
                    onChange={handleBatchSizePerEpochsChange}
                  />
                </div>
              </div>
              <div className="c-add-model__row justify">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Accuracy:</label>
                  <InputBase
                    value={accuracy}
                    allowClear={false}
                    className=""
                    placeholder="Enter accuracy"
                    type="number"
                    onBlur={handleAccuracyChange}
                  />
                </div>
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Precision: </label>
                  <div style={{ marginTop: 6 }}>
                    <Checkbox
                      label={"FP16"}
                      checked={precision === "FP16"}
                      onChange={handlePrecisionChange}
                    />
                  </div>
                  {/* <Select
                    className="c-add-model__select"
                    defaultValue={{ label: precision.toLocaleUpperCase(), value: precision }}
                    data={dataPrecision}
                    onChange={(option: SelectOption) => {
                      handlePrecisionChange(option);
                    }}
                  /> */}
                </div>
              </div>
            </div>
          </div>
          <div className="c-add-model__input-column mb-24">
            <div className="c-add-model__item__label">
              Model Descriptions
              <span className="required">*</span>
            </div>
            <HtmlEditor
              value={detail?.model_desc ?? data?.model_desc}
              onChange={(content) => handleChangeItem("model_desc", content)}
              customOptions={{
                height: 500,
                menubar: true,
                plugins: [
                  "link",
                  "code",
                  "image",
                  "help",
                  "insertdatetime",
                  "emoticons",
                  "lists",
                  "advlist",
                  "autolink",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "fullscreen",
                  "media",
                  "table",
                  "wordcount",
                ],
                toolbar:
                  "link image code emoticons | bullist insertdatetime | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
          </div>
          <div className="c-add-model__group">
            <div className="c-add-model__row justify full">
              <div className="c-add-model__item w-50-4" key="params">
                <span className="c-add-model__item__label">Price Unit:</span>
                <InputBase
                  value={detail?.price.toString() ?? data.price_per_hours?.toString()}
                  allowClear={false}
                  placeholder="..."
                  type="number"
                  validateNonNegativeInteger={true}
                  onChange={(e) =>
                    handleChangeItem("price_per_hours", e.target.value)
                  }
                />
                <span className="available">$/hr</span>
              </div>
            </div>
          </div>
          {/* <div className="c-add-model__group">
            <div className="full">
              <div className="flex flex-col gap-6">
                <Checkbox
                  size="sm"
                  label="Sequential sampling Tasks are ordered by Data manager ordering"
                  checked={data.check_sequential_sampling_tasks}
                  onChange={(e) =>
                    handleChangeItem("check_sequential_sampling_tasks", e)
                  }
                />
                <Checkbox
                  size="sm"
                  label="Random sampling. Tasks are chosen with uniform random"
                  checked={data.check_random_sampling}
                  onChange={(e) =>
                    handleChangeItem("check_random_sampling", e)
                  }
                />
              </div>
            </div>
          </div> */}
        </div>
        <div className="c-add-model__action">
          {isAdd ? (
            <>
              <Button
                className="c-add-model__action--cancel"
                type="secondary"
                onClick={() => navigate(`/models-seller`)}
              >
                Cancel
              </Button>
              <Button
                disabled={isDisableAddModel || isInValidModelSource || isInValidCheckpoint}
                className="c-add-model__action--add"
                onClick={addModelMarket}>
                Add
              </Button>
            </>
          ) : (
            <div className="c-add-model-group-btn">
              <button className="edit" onClick={editModel}>
                <IconSave />
                <span>Save</span>
              </button>
              <button
                className="delete"
                onClick={() => setShowModalDelete(true)}
              >
                <IconDeleteComputes />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </>
      <Suspense fallback={<AppLoading />}>
        <Modal
          title={
            <>
              <IconAlert /> Are you sure to delete?
            </>
          }
          open={showModalDelete}
          onCancel={() => setShowModalDelete(false)}
          className="models-delete-modal"
          cancelText="Cancel"
          submitText="Remove"
          onSubmit={() => deleteModel(computeId!)}
        >
          <div className="models-delete-modal-content">
            Are you sure you want to delete this model?
          </div>
        </Modal>
      </Suspense>
      <Suspense fallback={<AppLoading />}>
        <Modal
          title="You don't have enough compute"
          iconTitle={<IconError />}
          cancelText="Cancel"
          submitText="Add More Computes"
          closeOnOverlayClick={true}
          open={isOpenModalConfirm}
          onClose={() => setIsOpenModalConfirm(false)}
          onCancel={() => {
            setSelectedGPUs([]);
            setIsOpenModalConfirm(false);
          }}
          onSubmit={() => {
            window.open('/computes', '_blank');
            setIsOpenModalConfirm(false)
            // setOpenModalModel(false)
          }}
        >
          Insufficient computing power detected.<br />
          Please add more computes.
        </Modal>
      </Suspense>
    </div>
  );
};

export default AddModel;
