import React, { ChangeEvent, Dispatch, useEffect, useState } from "react";
import { TProjectModel } from "@/models/project";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import InputBase from "@/components/InputBase/InputBase";
import Select, {
  DataSelect,
  SelectOption,
} from "@/components/Select/Select";
import styled from "./index.module.scss";
import Checkbox from "@/components/Checkbox/Checkbox";
import { formatBytes } from "@/utils/customFormat";
import { storeInputFields, getStoreInputFields } from "../ML";
import useGetAnnotationTemplateDetail from "@/hooks/annotation/useAnnotationDetailTemplate";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import IconError from "@/assets/icons/IconError";
// import Modal from "@/components/Modal/Modal";
// import { useNavigate } from "react-router-dom";
// import IconError from "@/assets/icons/IconError";
// import IconSuccess from "@/assets/icons/IconSuccess";

type TGPU = {
  id: number;
  gpu_name: string;
  power_consumption: number | null;
  memory_usage: number | null;
  gpu_index: number;
  gpu_id: string;
  branch_name: string;
};

type TGPUList = {
  compute_gpus: TGPU[];
};

type TCPU = {
  name: string;
  cpu: string;
  ram: number;
  storage: number;
  diskType: string;
  os: string;
  serial_number: string;
  ip: string;
};

interface IModelPreviewProps {
  detail: TProjectModel | null | undefined;
  paramsValue?: number | undefined;
  handleParamsChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cpuFilters?: TCPU[];
  gpusFilter?: TGPUList[];
  model?: any;
  onUpdateModelData?: (data: any) => void;
  showEstimateCost: boolean;
  setDisableSubmit: Dispatch<React.SetStateAction<boolean>>;
  projectID: number;
  cpuIds?: number[]
}

type TCalculateComputeGpuResponse = {
  paramasters: string;
  mac: string;
  gpu_memory: number;
  tflops: number;
  time: number;
  total_cost: number;
  total_power_consumption: number;
};

const dataPrecision: DataSelect[] = [
  {
    label: "Select Precision",
    options: [
      { label: "FP16", value: "fp16" },
      { label: "FP32", value: "fp32" },
    ],
  },
];

const dataFramework: DataSelect[] = [
  {
    label: "Select Framework",
    options: [
      { label: "Pytorch", value: "pytorch" },
      { label: "Tensorflow", value: "tensowflow" },
      // { label: "Keras", value: "keras" },
      // { label: "Scikit-Learn", value: "scikit-learn" },
      // { label: "Hugging Face", value: "hugging-face" },
      // { label: "OpenNN", value: "opennn" },
      // { label: "PyBrain", value: "pybrain" },
      // { label: "OpenAI", value: "openai" },
      // { label: "IBM Watson", value: "ibm-watson" },
      // {
      //   label: "Microsoft Cognitive Toolkit (CNTK)",
      //   value: "microsoft-cognitive-toolkit",
      // },
      // { label: "DL4J (Deeplearning4j)", value: "dl4j" },
      // { label: "Theano", value: "theano" },
      // { label: "MXNet", value: "mxnet" },
      // { label: "Caffe", value: "caffe" },
      // { label: "XGBoost", value: "xgboost" },
      // { label: "Conclusion", value: "conclusion" },
    ],
  },
];

const ModelPreview = (props: IModelPreviewProps) => {
  const api = useApi();
  const {
    detail,
    paramsValue,
    handleParamsChange,
    cpuFilters,
    gpusFilter,
    model,
    onUpdateModelData,
    showEstimateCost,
    setDisableSubmit,
    projectID,
    cpuIds
  } = props;
  let modelConfig = null;

  try {
    modelConfig = model ? JSON.parse(model?.config) : null;
  } catch (e) {
  }


  const { annotation } = useGetAnnotationTemplateDetail(detail?.template_id?.toString());

  const [calculateComputeGpu, setCalculateComputeGpu] =
    useState<TCalculateComputeGpuResponse>();

  const [prevParamsValue, setPrevParamsValue] = useState<number | null>(null);


  const [samplingFrequency, setSamplingFrequency] = useState<string>(
    modelConfig?.sampling_frequency?.toString() || "48000"
  );
  const [fps, setFps] = useState<string>(modelConfig?.fps?.toString() || "");

  const [token, setToken] = useState<string>(
    model?.config?.token_length?.toString() || "4096"
  );
  const [mono, setMono] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState<{ width: string; height: string }>(
    {
      width: modelConfig?.image_width?.toString() || "213",
      height: modelConfig?.image_height?.toString() || "213",
    }
  );
  const [resolution, setResolution] = useState<string>(
    modelConfig?.resolution?.toString() || "320"
  );
  const [framework, setFramework] = useState<string>(
    modelConfig?.framework?.toString() || "pytorch"
  );
  const [accuracy, setAccuracy] = useState<string>(
    modelConfig?.accuracy?.toString() || "70"
  );
  const [precision, setPrecision] = useState<string>(
    modelConfig?.precision?.toString() || "fp16"
  );
  const [estimateTime, setEstimateTime] = useState<string>(calculateComputeGpu?.time?.toString() || '0');
  const [estimateCost, setEstimateCost] = useState<string>(calculateComputeGpu?.total_cost?.toString() || '0');
  // from project
  const [epochs, setEpochs] = useState<string>(
    detail?.epochs?.toString() || "10"
  );
  const [batchSize, setBatchSize] = useState<string>(
    detail?.batch_size?.toString() || "12"
  );
  const [batchSizePerEpochs, setBatchSizePerEpochs] = useState<string>(
    detail?.epochs?.toString() && detail?.batch_size?.toString()
      ? Math.round(detail?.batch_size / detail?.epochs).toString()
      : "12"
  );
  const [rentTime, setRentTime] = useState<string>('');
  const [rentCost, setRentCost] = useState<string>('');
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onUpdateModelData?.((prev: any) => ({
      ...prev,
      token_length: token,
      accuracy: accuracy,
      sampling_frequency: samplingFrequency,
      mono: mono,
      fps: fps,
      resolution: resolution,
      image_width: imageSize.width,
      image_height: imageSize.height,
      framework: framework,
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
      estimate_time: estimateTime,
      estimate_cost: estimateCost,
      rent_time: rentTime,
      rent_cost: rentCost,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageSize,
    mono,
    samplingFrequency,
    fps,
    resolution,
    framework,
    token,
    epochs,
    batchSize,
    batchSizePerEpochs,
    accuracy,
    precision,
    estimateTime,
    estimateCost,
    onUpdateModelData,
    calculateComputeGpu?.gpu_memory,
    calculateComputeGpu?.mac,
    calculateComputeGpu?.paramasters,
    calculateComputeGpu?.tflops,
    calculateComputeGpu?.time,
    calculateComputeGpu?.total_cost,
    calculateComputeGpu?.total_power_consumption,
    rentTime,
    rentCost
  ]);


  const handleImageSizeChange = (fieldName: string, value: string) => {
    setImageSize((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    storeInputFields({projectID, imageSize:{...imageSize, [fieldName]: value}})
  };
  const handleMonoChange = (newValue: boolean) => {
    setMono(newValue);
    storeInputFields({projectID, mono: newValue})
  };
  const handleSamplingFrequencyChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSamplingFrequency(event.target.value);
    storeInputFields({projectID, samplingFrequency: event.target.value})
  };

  const handleFpsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFps(event.target.value);
    storeInputFields({projectID, fps: event.target.value})
  };

  const handleResolutionChange = (option: SelectOption) => {
    setResolution(option.value);
    storeInputFields({projectID, resolution: option.value})
  };

  const handleFrameworkChange = (option: SelectOption) => {
    setFramework(option.value);
    storeInputFields({projectID, framework: option.value})
  };

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
    storeInputFields({projectID, token: event.target.value})
  };

  const handleEpochsChange = (event: ChangeEvent<HTMLInputElement>) => {
    // setEpochs(event.target.value);
    // storeInputFields({projectID, epochs: event.target.value})
    const value = event.target.value;
    const numberValue = parseInt(value, 10);

    if ((numberValue >= 0 &&  numberValue <= 1000)) {
      setEpochs(event.target.value);
      storeInputFields({ projectID, epochs: event.target.value })
    }else if (numberValue > 1000){
      setEpochs('1000');
      storeInputFields({ projectID, epochs: '1000' });
    }
    else {
      setEpochs('1');
      storeInputFields({ projectID, epochs: '1' });
    }
  };

  const handleBatchSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    // setBatchSize(event.target.value);
    // storeInputFields({projectID, batchSize: event.target.value})
    const value = event.target.value;
    const numberValue = parseInt(value, 10);

    if ((numberValue >= 0 &&  numberValue <= 500) || value === '') {
      setBatchSize(event.target.value);
      storeInputFields({ projectID, batchSize: event.target.value })
    }else if(numberValue >500) {
      setBatchSize('500');
      storeInputFields({ projectID, batchSize: '500' })
    }else{
      setBatchSize('1');
      storeInputFields({ projectID, batchSize: '1' });
    }
  };

  const handleBatchSizePerEpochsChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    // setBatchSizePerEpochs(event.target.value);
    // storeInputFields({projectID, batchSizePerEpochs: event.target.value})
    const value = event.target.value;
    const numberValue = parseInt(value, 10);

    if ((numberValue >= 0 &&  numberValue <= 1000)) {
      setBatchSizePerEpochs(value);
      storeInputFields({ projectID, batchSizePerEpochs: value });
    }else if(numberValue > 1000){
      setBatchSizePerEpochs('1000');
      storeInputFields({ projectID, batchSizePerEpochs: '1000' });
    }
    else {
      setBatchSizePerEpochs('1');
      storeInputFields({ projectID, batchSizePerEpochs: '1' });
    }
  };

  const handleAccuracyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAccuracy(event.target.value);
    storeInputFields({projectID, accuracy: event.target.value})
  };

  const handlePrecisionChange = (option: SelectOption) => {
    setPrecision(option.value);
    storeInputFields({projectID, precision: option.value})
  };

  // const handleEstimateTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setEstimateTime(event.target.value);
  //   storeInputFields({projectID, estimateTime: event.target.value})
  // };
  // const handleEstimateCostChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setEstimateCost(event.target.value);
  //   storeInputFields({projectID, estimateCost: event.target.value})
  // };
  

  useEffect(() => {
    let ar: TApiCallResult;

    if (
      // paramsValue &&
      gpusFilter &&
      gpusFilter?.length > 0 //&&
      // (!calculateComputeGpu || paramsValue !== prevParamsValue)
    ) {
      const fetchData = async () => {
        if (gpusFilter && gpusFilter.length > 0) {
          const urlSearchParams = new URLSearchParams();

          if (detail?.id) {
            urlSearchParams.append("project_id", detail.id.toString());
          }

          if (paramsValue) {
            urlSearchParams.append("paramaster", paramsValue.toString());
          }

          const gpuListIds = gpusFilter
            ? gpusFilter.flatMap((gpuList) =>
              gpuList ? gpuList.compute_gpus.map((gpu) => gpu.id.toString()) : []
            )
            : [];

          if (gpuListIds.length > 0) {
            urlSearchParams.append("gpu_list_id", gpuListIds.join(","));
            // urlSearchParams.append("gpu_list_id", '2');
          }

          if (model?.id) {
            urlSearchParams.append("model_id", model?.id?.toString());
          }

          // if (compute_id) {
          //   urlSearchParams.append("compute_id", compute_id);
          // }

          if (imageSize.width) {
            urlSearchParams.append("image_width", imageSize.width);
          }

          if (imageSize.height) {
            urlSearchParams.append("image_height", imageSize.height);
          }

          if (token) {
            urlSearchParams.append("token", token);
          }

          // if (!!cpuIds?.length) {
          //   urlSearchParams.append("cpu_list_id", cpuIds.join(","));
          // }
          const response: TApiCallResult = api.call("calculateComputeGpu", {
            query: urlSearchParams,
          });

          ar = response;

          try {
            const res = await response.promise;

            if (response.controller.signal.aborted) return;

            if (res.ok) {
              const data = await res.json();
              if (data.can_rent === false) {
                setIsOpenModalConfirm(true)
                setDisableSubmit(true)
              }
              setCalculateComputeGpu(data);
              setEstimateCost(data.total_cost)
              setEstimateTime(data.time)
              setRentTime(data.time)
              setRentCost(data.total_cost)
            }
          } catch (error) { }
        }
      };

      fetchData();
    }
    if (paramsValue !== undefined) {
      setPrevParamsValue(paramsValue);
    }

    if (calculateComputeGpu && calculateComputeGpu.total_cost) {
      setDisableSubmit(false);
    }

    return () => {
      ar?.controller.abort("Component unmounted");
    }
  }, [
    cpuIds,
    gpusFilter,
    paramsValue,
    detail,
    api,
    model,
    imageSize,
    token,
    handleParamsChange,
    calculateComputeGpu,
    prevParamsValue,
    setDisableSubmit,
  ]);

  useEffect(() => {
    const currentInputs = getStoreInputFields(projectID);
    if (currentInputs) {
      currentInputs.samplingFrequency && setSamplingFrequency(currentInputs.samplingFrequency);
      currentInputs.fps && setFps(currentInputs.fps);
      currentInputs.token && setToken(currentInputs.token);
      currentInputs.mono !== undefined && setMono(currentInputs.mono);
      currentInputs.imageSize && setImageSize(currentInputs.imageSize);
      currentInputs.resolution && setResolution(currentInputs.resolution);
      currentInputs.framework && setFramework(currentInputs.framework);
      currentInputs.accuracy && setAccuracy(currentInputs.accuracy);
      currentInputs.precision && setPrecision(currentInputs.precision);
      currentInputs.epochs && setEpochs(currentInputs.epochs);
      currentInputs.batchSize && setBatchSize(currentInputs.batchSize);
      currentInputs.batchSizePerEpochs && setBatchSizePerEpochs(currentInputs.batchSizePerEpochs);
      // currentInputs.estimateTime && setEstimateTime(currentInputs.estimateTime);
      // currentInputs.estimateCost && setEstimateCost(currentInputs.estimateCost);
    }
  }, [projectID]);

  const handleEstimateTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRentTime(event.target.value);
    setRentCost(String(+event.target.value * +rentCost))
    storeInputFields({ projectID, estimateTime: event.target.value })
  };


  return (
    <div className={styled.wrapper}>
      <div className="p-model-detail__info-percent">
        <div className={styled.wrapper_flop}>
          <div className="c-percents__item danger" key="flops">
            <span>FLOPs:</span>
            <div>
              <span>{calculateComputeGpu?.tflops || "-"}</span>
            </div>
          </div>
          <div className="c-percents__item danger" key="macs">
            <span>MAC:</span>
            <div>
              <span>{calculateComputeGpu?.mac || "-"}</span>
            </div>
          </div>
          <div className="c-percents__item" key="params">
            <label>Params</label>
            <InputBase
              value={
                paramsValue
                  ? paramsValue.toString()
                  : ""
              }
              allowClear={false}
              className="c-percents__item__input-number"
              placeholder="Enter parameters"
              type="number"
              onBlur={handleParamsChange}
              validateNonNegativeInteger={true}
            />
          </div>
        </div>
      </div>

      <div className={styled.wrapper}>
        {/* modal option of project type */}
        {((cpuFilters && cpuFilters.length > 0) ||
          (gpusFilter && gpusFilter.length > 0 && calculateComputeGpu && calculateComputeGpu?.gpu_memory > 0)) && (
            <div className={styled.group}>

              {calculateComputeGpu && (
                <div className="p-model-selected__info">
                  <div className="p-model-selected__item">
                    <div>GPU</div>
                    <div>
                      <span>
                        Memory: {formatBytes(calculateComputeGpu?.gpu_memory)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {cpuFilters?.map((i: any, index: number) => {
                return (
                  <div className="p-model-selected__info">
                    <div className="p-model-selected__item" key={`key-${index}`}>
                      <div>{`${index + 1}. CPU`}</div>
                      <div>
                        <span>
                          {`Memory: 
                            ${formatBytes(i?.ram)} - Storage: ${formatBytes(i?.storage)} ${i?.ip ? `-  ${i.ip}` : ""}`}
                        </span>
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          )}

        <div className={styled.wrapper}>

          <React.Fragment >
            {(annotation?.catalog_model.key === "computer_vision") && (
              <div className={styled.group}>
                <div className={styled.row}>
                  <div className={styled.item}>
                    <label>Image size: </label>
                    <InputBase
                      value={imageSize.width}
                      allowClear={false}
                      className="c-percents__item-input"
                      placeholder="Enter image width"
                      type="number"
                      onBlur={(e) =>
                        handleImageSizeChange("width", e.target.value)
                      }
                      validateNonNegativeInteger={true}
                    />
                  </div>
                  <div className={styled.item}>
                    <label>x </label>
                    <InputBase
                      value={imageSize.height}
                      allowClear={false}
                      className="c-percents__item-input"
                      placeholder="Enter image height"
                      type="number"
                      onBlur={(e) =>
                        handleImageSizeChange("height", e.target.value)
                      }
                      validateNonNegativeInteger={true}
                    />
                  </div>
                </div>
              </div>
            )}
            {(annotation?.catalog_model.key === "audio_speech_processing") && (
              <div className={styled.group}>
                <div className={styled.row}>
                  <div className={styled.item}>
                    <label>Sampling frequency: </label>
                    <InputBase
                      value={samplingFrequency}
                      allowClear={false}
                      className="c-percents__item-input"
                      placeholder="Sampling frequency"
                      type="number"
                      onBlur={handleSamplingFrequencyChange}
                      validateNonNegativeInteger={true}
                    />
                  </div>
                  <div className={styled.item}>
                    <label>Mono: </label>

                    <div className={styled.checkbox}>
                      <Checkbox
                        label="True"
                        checked={mono === true}
                        onChange={(value) => handleMonoChange(value)}
                        size="sm"
                      />
                      <Checkbox
                        label="False"
                        checked={mono === false}
                        onChange={(value) => handleMonoChange(!value)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(annotation?.catalog_model.key === "generative_ai" || annotation?.catalog_model.key === "llm" || annotation?.catalog_model.key === "nlp") && (
              <div className={styled.group}>
                <div className={styled.row}>
                  <div className={styled.item}>
                    <label>Sequence token length:</label>
                    <InputBase
                      value={token}
                      allowClear={false}
                      className="percents__item__input-number"
                      placeholder="Enter token length"
                      type="number"
                      onBlur={handleTokenChange}
                      validateNonNegativeInteger={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
          {Object.keys(detail?.data_types ?? {}).map((key, index) => (
            <React.Fragment key={index}>
              {(key === "video" || annotation?.catalog_model.key === "video") && (
                <div className={styled.group}>
                  <div className={styled.row}>
                    <div className={styled.item}>
                      <label>Fps: </label>
                      <InputBase
                        value={fps}
                        allowClear={false}
                        className="c-percents__item-input"
                        placeholder="Enter Fps"
                        type="number"
                        onBlur={handleFpsChange}
                        validateNonNegativeInteger={true}
                      />
                    </div>
                    <div className={styled.item}>
                      <Select
                        className={styled.select}
                        defaultValue={{ label: '320', value: '320' }}
                        label="Resolution:"
                        data={[
                          {
                            label: "",
                            options: [
                              {
                                label: "320",
                                value: "320",
                              },
                              {
                                label: "1080",
                                value: "1080",
                              },
                            ],
                          },
                        ]}
                        onChange={handleResolutionChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          <div className={styled.group}>
            <div className={styled.row}>
              <div className={styled.item}>
                <Select
                  className={styled.select}
                  defaultValue={{ label: framework, value: framework }}
                  label="Framework:"
                  data={dataFramework}
                  onChange={handleFrameworkChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* load Epochs,Batch Size,batch size per Epochs,accuracy from ml learning  */}
        <div className={styled.group}>
          <div className={styled.row}>
            <div className={styled.item}>
              <label>Epochs:</label>
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
            <div className={styled.item}>
              <label>Batch Size:</label>
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
          <div className={styled.row}>
            <div className={styled.item}>
              <label className={styled.label}>Batch size per Epochs:</label>
              <InputBase
                value={batchSizePerEpochs}
                allowClear={false}
                className={styled.input}
                placeholder="Enter Batch size per epochs"
                type="number"
                onBlur={handleBatchSizePerEpochsChange}
                onChange={handleBatchSizePerEpochsChange}
              />
            </div>
          </div>
          <div className={styled.row}>
            <div className={styled.item}>
              <label>Accuracy:</label>
              <InputBase
                value={accuracy}
                allowClear={false}
                className=""
                placeholder="Enter accuracy"
                type="number"
                onBlur={handleAccuracyChange}
              />
            </div>
            <div className={styled.item}>
              <Select
                className={styled.select}
                defaultValue={{ label: precision.toLocaleUpperCase(), value: precision }}
                label="Precision"
                data={dataPrecision}
                onChange={(option: SelectOption) => {
                  handlePrecisionChange(option);
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-model-selected__info">
          <div className={styled.row}>
            <div className={styled.item}>
              <label className={styled.label}>Estimate time train:</label>
              <InputBase
                value={String(rentTime)}
                allowClear={false}
                className={styled.estimate}
                placeholder="Enter time train"
                type="number"
                onBlur={(event) => {
                  handleEstimateTimeChange(event)
                }}
                isDefaultValue={false}
              />
              Hours
            </div>
          </div>
          {showEstimateCost && (
            <div className={styled.row}>
              <div className={styled.item}>
                <label className={styled.label}>Estimate cost:</label>
                <InputBase
                  value={String(rentCost)}
                  allowClear={false}
                  className={styled.estimate}
                  placeholder="Estimate cost"
                  type="number"
                  readonly
                />
                $
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        title="You don't have enough compute"
        iconTitle={<IconError />}
        cancelText="Cancel"
        submitText="Add More Computes"
        closeOnOverlayClick={true}
        open={isOpenModalConfirm}
        onClose={() => setIsOpenModalConfirm(false)}
        onCancel={() => setIsOpenModalConfirm(false)}
        onSubmit={() => {
          navigate('/computes')
        }}
      >
        Insufficient computing power detected.<br />
        Please add more computes.
      </Modal>

      {/* <Modal
        title="Add compute completed"
        iconTitle={<IconSuccess />}
        submitText="Finish"
        closeOnOverlayClick={true}
        open={isOpenModalAddComputeDone}
        onClose={() => setIsOpenModalAddComputeDone(false)}
        onSubmit={() => setIsOpenModalAddComputeDone(false)}
      >
        Time for a quick musical interlude! We're setting up Docker containers and environments on the computes just for you. This process typically takes about 1 minute per compute, although timing can vary based on the internet connection from the GPU provider. We appreciate your patience!
      </Modal> */}
    </div>
  );
};

export default ModelPreview;
