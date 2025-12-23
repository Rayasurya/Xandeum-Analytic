import styles from "./ModelSellerForm.module.scss";
import InputBase from "@/components/InputBase/InputBase";
import ModelTasks from "@/components/ModelTasks/ModelTasks";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import ComputeSelect, {TSelectedComputes} from "@/components/ComputeSelect/ComputeSelect";
import {useGetListMarketplaceGpus} from "@/hooks/settings/ml/useGetListMarketplaceGpus";
import Parameters from "@/components/Model/Parameters";
import useComputeParameters from "@/hooks/computes/useComputeParameters";
import AutoProvision from "@/components/AutoProvision/AutoProvision";
import Source, {isValidSourceData, TSourceData} from "@/components/Model/Source";
import Checkpoint, {isValidCheckpoint, TCheckpointData} from "@/components/Model/Checkpoint";
import HtmlEditor from "@/components/HtmlEditor/HtmlEditor";
import {TOKEN_SYMBOL_DEFAULT} from "@/constants/projectConstants";
import {useNavigate, useParams} from "react-router-dom";
import useGetModelMarketplaceSell from "@/hooks/modelsSeller/useGetModelMarketplaceSell";
import {TModelMarketplaceSell} from "@/hooks/modelsSeller/useGetModelMarketplaceListSell";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import {useApi} from "@/providers/ApiProvider";
import {toastError} from "@/utils/toast";
import {extractErrorMessage, extractErrorMessageFromResponse} from "@/utils/error";
import {useUserLayout} from "@/layouts/UserLayout";
import useModelTasks from "@/hooks/models/useModelTasks";
import Upload from "@/components/Upload/Upload";

export type TModelSellerFormMainProps = {
  model?: TModelMarketplaceSell | null;
}

function ModelSellerFormMain({model}: TModelSellerFormMainProps) {
  const {loading, gpusListModel} = useGetListMarketplaceGpus("0", "0", "model-training");

  const [name, setName] = React.useState(model?.name ?? "");
  const onNameChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setName(ev.currentTarget.value);
  }, [setName]);

  const modelTaskIds = useMemo(() => (model?.tasks ?? []).map(t => t.id), [model?.tasks]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>(modelTaskIds);

  const [selectedComputes, setSelectedComputes] = React.useState<TSelectedComputes>({cpus: [], gpus: []});
  const {paramsData, onCalculateComputeGpu, calculatedComputeGpu, onParameterChange, updateParamsData} = useComputeParameters({
    selectedComputes,
    projectID: "0"
  });

  const [sourceData, setSourceData] = React.useState<TSourceData>({
    model_id: model?.model_id ?? null,
    model_token: model?.model_token ?? null,
    model_source: (model?.model_source ?? null) as TSourceData["model_source"],
    docker_image: model?.docker_image ?? null,
    docker_access_token: model?.docker_access_token ?? null,
    file: null,
  });
  const onSourceChange = React.useCallback((d: TSourceData) => {
    setSourceData(d);
  }, [setSourceData]);

  const [checkpointData, setCheckpointData] = React.useState<TCheckpointData>({
    checkpoint_source: (model?.checkpoint_source ?? null) as TCheckpointData["checkpoint_source"],
    checkpoint_id: model?.checkpoint_id ?? null,
    checkpoint_token: model?.checkpoint_token ?? null,
  });
  const onCheckpointChange = React.useCallback((d: TCheckpointData) => {
    setCheckpointData(d);
  }, [setCheckpointData]);

  const [description, setDescription] = React.useState(model?.model_desc ?? "");
  const [price, setPrice] = React.useState<string>(model?.price?.toString() ?? "0");
  const [file, setFile] = React.useState<File | null>(null);

  //
  // Form data
  //

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const isValidFormData = useCallback(() => {
    const errors: Record<string, string[]> = {};

    if (name.trim() === "") {
      errors["name"] = ["Please specify the name of the model."];
    }

    const _price = parseFloat(price);

    if (isNaN(_price) || _price < 0) {
      errors["price"] = ["Please enter a valid price."];
    }

    if (selectedTaskIds.length === 0) {
      errors["tasks"] = ["Please select the supported tasks."];
    }

    if (!isValidSourceData(sourceData, true)) {
      errors["source"] = ["Please specify the model source and fill all required fields."];
    }

    if (!isValidCheckpoint(checkpointData, false)) {
      errors["checkpoint"] = ["Please fill all required fields."];
    }

    if (file && selectedComputes.gpus.length === 0) {
      toastError("Please select at least one GPU to use the sample dataset.");
      errors["compute"] = ["Please select at least one GPU to use the sample dataset."]
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [checkpointData, file, name, price, selectedComputes.gpus.length, selectedTaskIds.length, sourceData]);

  const buildFormData = useCallback(() => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("docker_image", sourceData.docker_image ?? "");
    formData.append("docker_access_token", sourceData.docker_access_token ?? "");
    formData.append("gpus", JSON.stringify(selectedComputes.gpus));

    if (file) {
      formData.append("file", file);
    }

    if (selectedComputes.cpus.length > 0) {
      formData.append("cpus_ids", JSON.stringify(selectedComputes.cpus));
    }

    formData.append("model_desc", description);
    formData.append("compute_id", "0");
    formData.append("model_source", sourceData.model_source ?? "");
    formData.append("model_token", sourceData.model_token ?? "");
    formData.append("model_id", sourceData.model_id ?? "");
    formData.append("checkpoint_source", checkpointData.checkpoint_source ?? "");
    formData.append("checkpoint_id", checkpointData.checkpoint_id ?? "");
    formData.append("checkpoint_token", checkpointData.checkpoint_token ?? "");
    formData.append("check_sequential_sampling_tasks", "false");
    formData.append("check_random_sampling", "false");
    formData.append("catalog_id", "0");
    formData.append("price", price);

    if (!model) {
      formData.append("model_info", JSON.stringify({
        calculate_compute_gpu: calculatedComputeGpu,
        token_length: "1024",
        accuracy: "70",
        sampling_frequency: "8000",
        mono: true,
        fps: "24",
        resolution: "320",
        precision: "fp16",
        image_width: "213",
        image_height: "213",
        framework: "pytorch",
        rent_time: "",
        rent_cost: "",
        estimate_time: "",
        estimate_cost: "",
        project: {
          epochs: "10",
          batch_size: "12",
          batch_size_per_epochs: "12",
        },
      }));
    }

    // @TODO: This logic is not clear
    // formData.append("auto_provision", data.auto_provision?.toString() ?? "");

    return formData;
  }, [calculatedComputeGpu, checkpointData.checkpoint_id, checkpointData.checkpoint_source, checkpointData.checkpoint_token, description, file, model, name, price, selectedComputes.cpus, selectedComputes.gpus, sourceData.docker_access_token, sourceData.docker_image, sourceData.model_id, sourceData.model_source, sourceData.model_token]);

  //
  // Save Model
  //

  const [isSaving, setIsSaving] = useState(false);
  const api = useApi();
  const navigate = useNavigate();
  const {assignTasks, unassignTasks} = useModelTasks();

  const save = useCallback(() => {
    if (!isValidFormData()) {
      return;
    }

    setIsSaving(true);
    const ar = model
      ? api.call("updateModelMarketplace", {body: buildFormData(), params: {id: model.id.toString()}})
      : api.call("commercializeModel", {body: buildFormData()});

    ar.promise
      .then(async (r) => {
        if (r.ok) {
          const data = await r.clone().json();

          unassignTasks(model?.id ?? data["id"], modelTaskIds).promise
            .then(() => {
              assignTasks(model?.id ?? data["id"], selectedTaskIds).promise
                .finally(() => {
                  navigate("/models-seller");
                });
            });
        } else {
          toastError(await extractErrorMessageFromResponse(r));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch(e => {
        toastError(extractErrorMessage(e));
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [api, assignTasks, buildFormData, isValidFormData, model, modelTaskIds, navigate, selectedTaskIds, unassignTasks]);

  //
  // Nav
  //

  const {setActions, clearActions, setCloseCallback, clearCloseCallback, setBreadcrumbs, clearBreadcrumbs} = useUserLayout();

  useEffect(() => {
    setCloseCallback("/models-seller");

    setActions([
      {
        label: model ? "Save" : "Create",
        actionType: "primary",
        onClick: model ? save : save,
      },
    ]);

    setBreadcrumbs([
      {label: "Commercialize my model"},
    ]);

    return () => {
      clearActions();
      clearCloseCallback();
      clearBreadcrumbs();
    }
  }, [save, clearActions, clearBreadcrumbs, clearCloseCallback, model, setActions, setBreadcrumbs, setCloseCallback]);

  return (
    <div className={styles.root}>
      <div className={`${styles.section}`}>
        <div className={styles.split}>
          <InputBase
            autoFocus
            label="Name:"
            isControlledValue={true}
            isRequired
            value={name}
            error={validationErrors?.["name"]?.[0]}
            onChange={onNameChange}
            disabled={isSaving}
          />
          <InputBase
            label={`Price (${TOKEN_SYMBOL_DEFAULT}/hour)`}
            value={price}
            allowClear={false}
            placeholder="Enter the price here"
            type="number"
            isRequired={true}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            disabled={isSaving}
            error={validationErrors?.["price"]?.[0]}
          />
        </div>
      </div>
      <div className={`${styles.section}`}>
        <ModelTasks
          label="Supported tasks:"
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          isRequired
          showFullDescription
          error={validationErrors?.["tasks"]?.[0]}
        />
      </div>
      <div className={`${styles.section} ${styles.sectionWithBg}`}>
        <Source
          label="Model source"
          data={sourceData}
          onChange={onSourceChange}
          isProcessing={isSaving}
          isRequired={true}
          isSourceCode={false}
          disallowedSources={["LOCAL"]}
          error={validationErrors?.["source"]?.[0]}
        />
      </div>
      <div className={`${styles.section} ${styles.sectionWithBg}`}>
        <Checkpoint
          data={checkpointData}
          onChange={onCheckpointChange}
          isProcessing={isSaving}
          isRequired={false}
          error={validationErrors?.["checkpoint"]?.[0]}
        />
      </div>
      <div className={`${styles.section} ${styles.sectionWithBg}`}>
        <ComputeSelect
          isLoading={loading}
          computes={gpusListModel}
          selected={selectedComputes}
          onChange={v => setSelectedComputes(v)}
          onClose={() => updateParamsData()}
          isProcessing={isSaving}
          // isRequired={true}
        />
        <Parameters
          data={paramsData}
          onCalculateComputeGpu={onCalculateComputeGpu}
          onParameterChange={onParameterChange}
          isProcessing={isSaving}
        />
        <AutoProvision/>
      </div>
      <div className={`${styles.section}`}>
        <Upload
          className={styles.upload}
          name="csv_file"
          describe="Sample dataset for trial train (optional, compute is required if you provide sample dataset)."
          onUpload={f => setFile(f)}
          clearFile={() => setFile(null)}
          accept={".zip,.zar,application/zip,application/x-zip-compressed,application/octet-stream"}
        />
      </div>
      <div className={`${styles.section}`}>
        <HtmlEditor
          value={description}
          onChange={(content) => setDescription(content)}
          customOptions={{
            readonly: isSaving,
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
    </div>
  );
}

export default function ModelSellerForm() {
  const {id} = useParams();
  const isEdit = useMemo(() => !isNaN(parseInt(id ?? "")), [id]);
  const {detail, errorLoading, loading} = useGetModelMarketplaceSell(id);

  if (isEdit) {
    if (loading) {
      return <EmptyContent message="Getting model..."/>;
    } else {
      if (errorLoading) {
        return <EmptyContent message={errorLoading}/>;
      }
    }
  }

  return (
    <ModelSellerFormMain model={detail}/>
  );
}
