import React, {Dispatch, SetStateAction, useMemo, useRef, useState} from "react";
import Button from "@/components/Button/Button";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";
import {TProjectModel} from "@/models/project";
import {IAddModelData} from "../ML";
import useProjectHook from "@/hooks/project/useProjectHook";
import ModelPreview from "../ModelPreviewNew/Index";
import "./Index.scss";
import {Gpus} from "@/hooks/settings/ml/useUpdateModelMarketplace";
import {TMarketplaceGpuListModel} from "@/models/marketplaceGpuList";
import {useLocation} from "react-router-dom";
import {formatBytes} from "@/utils/customFormat";
import {Config} from "@/components/ManageConnect/ManageConnect";

type TBuyModelMarketplaceFormProps = {
  validationErrors: {
    [k: string]: string[];
  };
  addModelData: IAddModelData;
  selectableGpus: DataSelect[];
  isloading?: boolean;
  addModel: () => void;
  onUpload: (file: any) => void;
  onFieldChange: (field: string, value: string | SelectOption[] | number | boolean | File) => void;
  data?: TProjectModel | null;
  gpusListModel?: TMarketplaceGpuListModel | [];
  onUpdateModelData?: (data: any) => void;
  projectID: number;
  onSelectComputes: (data: Gpus[]) => void;
  selectedGpus: Gpus[];
  selectedCpus: Gpus[];
  changedTime?: Date;
  closeModalModel?: () => void;
  confirmSelectComputes: () => void;
  setAddModelData: Dispatch<SetStateAction<IAddModelData>>,
  paramsValue: number | undefined,
  setParamsValue: Dispatch<SetStateAction<number | undefined>>,
  config: {
    [key: string]: Config;
  },
  setConfig: Dispatch<React.SetStateAction<{
    [key: string]: Config;
  }>>,
};

const BuyModelMarketplaceForm = (props: TBuyModelMarketplaceFormProps) => {
  const {
    addModelData,
    selectableGpus,
    addModel,
    onFieldChange,
    data,
    gpusListModel,
    onUpdateModelData,
    projectID,
    onSelectComputes,
    selectedGpus,
    selectedCpus,
    changedTime,
    closeModalModel,
    confirmSelectComputes,
    setAddModelData,
    paramsValue,
    setParamsValue,
    config,
    setConfig,
  } = props;

  const location = useLocation();
  const { item } = location.state || {};
  const { detail } = useProjectHook(Number(data?.id));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const isFetchComputes = useRef(false);
  const [isInValidModelSource, setIsInValidModelSource] = useState<boolean>(true);
  const [, setIsInValidCheckpoint] = useState<boolean>(true);
  let checkParams = false

  const handleParamsChange = (v: number) => {
    setParamsValue(v);
    isFetchComputes.current = true;
  };

  const gpusIds = selectedGpus.map((item) => ({
    id: item.compute_id,
    val: (item.gpus_id as string).split(","),
  }));

  const computeIds = selectedGpus.map((item) => item.compute_id.toString());

  const cpuIds = selectedCpus?.map((item) => ({
    id: item.compute_id,
  }));
  const computeGpus = gpusListModel?.filter(
    (item) => item.compute_gpus?.length > 0
  );
  const gpusList = computeGpus?.filter((item) =>
    computeIds.includes(item.compute_id.toString())
  );

  const cpuList = gpusListModel?.filter(
    (item) => item?.compute_cpu && Object.keys(item?.compute_cpu)?.length > 0
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

  const isDisableAddModel = useMemo(() => {
    const isEmpty = (field: any) => field.length === 0;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    checkParams = !!(paramsValue === undefined || paramsValue);

    return isEmpty(addModelData.model_source) ||
      // isEmpty(addModelData.name) ||
      (!selectedCpus?.length && !selectedGpus?.length) || !checkParams;
  }, [addModelData, paramsValue, selectedCpus?.length, selectedGpus?.length]);

  const cpuFilters = cpuIds?.map((item2) => {
    return cpuList?.find((item1) => item1.compute_id === item2.id)?.compute_cpu;
  });

  return (
    <div className="c-ml__add-form">
      <div className="c-ml__add-form-wrapper">
        {/* <div className="c-model-preview__input-column">
          <div className="c-model-preview__item__label">
            <label>Title</label>
            <span className="required">*</span>
          </div>
          <InputBase
            placeholder="Type..."
            onChange={(e) => {
              onFieldChange(FEILD_ENUM[1], e.target.value)
            }}
            value={addModelData["name"]}
            error={
              Object.hasOwn(validationErrors, "name")
                ? validationErrors["name"][0]
                : null
            }
            allowClear={false}
          />
        </div> */}

        <ModelPreview
          showEstimateCost={false}
          detail={detail}
          paramsValue={paramsValue}
          handleParamsChange={handleParamsChange}
          gpusFilter={gpusFilter as any}
          cpuFilters={cpuFilters as any}
          model={item}
          onUpdateModelData={onUpdateModelData}
          setDisableSubmit={setDisableSubmit}
          projectID={projectID}
          lastChanged={changedTime}
          isFetchComputes={isFetchComputes}
          onFieldChange={onFieldChange}
          modelPreviewType="ADD-MODEL"
          addModelData={addModelData}
          setAddModelData={setAddModelData}
          setIsInValidModelSource={setIsInValidModelSource}
          setIsInValidCheckpoint={setIsInValidCheckpoint}
          config={config}
          setConfig={setConfig}
        >
          <div className="c-model-preview__input-column">
            <div className="c-model-preview__item__label">
              <label>Select Computes</label>
              <span className="required">*</span>
            </div>
            <Select
              data={selectableGpus}
              className="c-ml__select-model"
              isMultiple={true}
              type="checkbox"
              onMultipleChange={(opts) => {
                onFieldChange("computes", opts);
                onSelectComputes(
                  opts.map((o) => ({ compute_id: o.data.compute_id, gpus_id: o.value, machine_options: o.data.gpu?.machine_options }))
                );
                isFetchComputes.current = true
              }}
              placeholderText={
                selectableGpus?.length === 0 ? "No computes are available" : "Please select a compute"
              }
              // isLoading={isloading}
              defaultValue={addModelData.computes}
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
            />
          </div>
        </ModelPreview>
        {/*<div className="c-ml__add-form-content bottom">
          <div className="c-task-sampling__radio-option">
            <Checkbox
              size="sm"
              label="Sequential sampling Tasks are ordered by Data manager ordering"
              checked={addModelData.check_sequential_sampling_tasks}
              onChange={(val) => onFieldChange("check_sequential_sampling_tasks", val)}
            />
          </div>
          <div className="c-task-sampling__radio-option">
            <Checkbox
              size="sm"
              label="Random sampling. Tasks are chosen with uniform random"
              checked={addModelData.check_random_sampling}
              onChange={(val) => onFieldChange("check_random_sampling", val)}
            />
          </div>
        </div>*/}
      </div>
      <div className="c-ml__add-form__action">
        <Button
          size="small"
          type="secondary"
          onClick={closeModalModel}
          className="c-ml__add-form__action--cancel"
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="secondary"
          onClick={addModel}
          disabled={isDisableAddModel || disableSubmit || isInValidModelSource}
          className="c-ml__add-form__action--add"
        >
          Add Model
        </Button>
      </div>
    </div>
  );
};

export default BuyModelMarketplaceForm;
