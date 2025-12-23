import { Suspense, useEffect, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Modal from "@/components/Modal/Modal";
import Select, {DataSelect} from "@/components/Select/Select";
import { TCreateModel, useCreateModel } from "@/hooks/admin/model/useCreateModel";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import "./AddModelModal.scss";
import InputBase from "@/components/InputBase/InputBase";
import HtmlEditor from "@/components/HtmlEditor/HtmlEditor";
import {toastError} from "@/utils/toast";
import Checkpoint from "@/components/Model/Checkpoint";
import Source from "@/components/Model/Source";
import useModelTasks from "@/hooks/models/useModelTasks";
import UserSelect from "@/components/UserSelect/UserSelect";
import ModelTasks from "@/components/ModelTasks/ModelTasks";

type AddModelModalProps = {
  isOpenModal: boolean;
  dataEdit?: TCreateModel;
  setCloseModal: () => void;
  onCreated: () => void;
  taskIds?: number[],
};

enum ModelType {
  MODEL_SYSTEM = "MODEL-SYSTEM",
  MODEL_CUSTOMER = "MODEL-CUSTOMER",
}

const modelTypeOptions: DataSelect[] = [{
  options: Object.entries(ModelType).map(
    ([key, value]) => ({
      label: key,
      value: value,
    })
  ),
}];

const modelStatusOptions: DataSelect[] = [{
  options: [
    {label: "created", value: "created"},
    {label: "in_marketplace", value: "in_marketplace"},
    {label: "rented_bought", value: "rented_bought"},
    {label: "completed", value: "completed"},
    {label: "pending", value: "pending"},
    {label: "suspend", value: "suspend"},
    {label: "expired", value: "expired"},
    {label: "failed", value: "failed"},
  ],
}];

const AddModelModal = (props: AddModelModalProps) => {
  const { isOpenModal, dataEdit, setCloseModal, onCreated } = props;
  const [model, setModel] = useState<TCreateModel>(Object.assign(dataEdit ?? {}, {}));
  const {author_id, owner_id, config, name, type, model_desc, status} = model;
  const [selectedTaskIds, setSelectedTaskIds] = useState(props.taskIds ?? []);
  const {assignTasks, unassignTasks} = useModelTasks();

  const defaultTypeValue = modelTypeOptions
    .flatMap((dataSelect) => dataSelect.options)
    .find((option) => option.value === type || null);

  const defaultStatusValue = modelStatusOptions
    .flatMap((dataSelect) => dataSelect.options)
    .find((option) => option.value === status || null);

  const {onCreate: saveModel, error, loading: savingModel} = useCreateModel(model, !!dataEdit);
  useBooleanLoader(savingModel, "Saving model...");

  useEffect(() => {
    if (error && "system" in error && error.system.length > 0) {
      toastError(error.system[0], {toastId: "admin-model-form"});
    }
  }, [error]);

  const handleChangeModel = ({
    key,
    value,
  }: {
    key: string;
    value: string | number | boolean;
  }) => {
    setModel({ ...model, [key]: value });
  };
  
  return (
    <Suspense>
      <Modal
        open={isOpenModal && !savingModel}
        title={`${dataEdit ? "Edit" : "Add"} Model`}
        className="add-model-modal"
        icon={dataEdit ? undefined : <IconPlus />}
        onCancel={setCloseModal}
        submitText={dataEdit ? "Edit" : "Add"}
        onSubmit={() => saveModel(async (modelID: number) => {
          if (props.taskIds && props.taskIds.length > 0) {
            await unassignTasks(modelID, props.taskIds).promise;
          }

          if (selectedTaskIds.length > 0) {
            await assignTasks(modelID, selectedTaskIds).promise;
          }

          onCreated();
        })}
      >
        <div className="add-user-modal-form">
          <div className="add-user-modal-form__group">
            <InputBase
              label="Name:"
              placeholder="Type something"
              value={ name ?? "" }
              onChange={ e => handleChangeModel({ key: "name", value: e.target.value }) }
              error={ error ? error?.["name"]?.[0] : null }
              isRequired
              disabled={ savingModel }
            />
          </div>
          <div className="add-user-modal-form__group">
            <ModelTasks
              label="Supported tasks:"
              placeholder="Select supported tasks of this model"
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
            />
          </div>
          {/*<div className="add-user-modal-form__group w-half">
            <InputBase
              label="IP Port Of The Device:"
              placeholder="Type something"
              value={ip_address ?? ""}
              onChange={(e) =>
                handleChangeModel({ key: "ip_address", value: e.target.value })
              }
              error={error ? error?.["ip_address"]?.[0] : null}
            />
          </div>*/ }
          <div className="add-user-modal-form__group w-half">
            <Select
              label="Type:"
              data={ modelTypeOptions }
              defaultValue={ defaultTypeValue }
              onChange={ e => handleChangeModel({ key: "type", value: e.value }) }
              error={ error ? error?.["type"]?.[0] : null }
              isRequired
              disabled={ savingModel }
            />
          </div>
          <div className="add-user-modal-form__group w-half">
            <Select
              label="Status:"
              data={ modelStatusOptions }
              defaultValue={ defaultStatusValue }
              onChange={ e => handleChangeModel({ key: "status", value: e.value }) }
              error={ error ? error?.["status"]?.[0] : null }
              isRequired
              disabled={ savingModel }
            />
          </div>
          <div className="add-user-modal-form__group w-half">
            <UserSelect
              label="Owner:"
              value={owner_id}
              onChange={v => handleChangeModel({ key: "owner_id", value: v })}
              required={true}
              disabled={savingModel}
              error={error ? error?.["owner_id"]?.[0] : null}
            />
          </div>
          <div className="add-user-modal-form__group w-half">
            <UserSelect
              label="Author:"
              value={author_id}
              onChange={v => handleChangeModel({ key: "author_id", value: v })}
              required={true}
              disabled={savingModel}
              error={error ? error?.["author_id"]?.[0] : null}
            />
          </div>
          <div className="add-user-modal-form__group">
            <div style={ { display: "flex", flexDirection: "column", gap: 16 } }>
              <Source
                data={ { ...model, file: null } }
                onChange={ v => setModel(m => ({ ...m, ...v })) }
                disallowedSources={ [ "LOCAL" ] }
                isProcessing={ savingModel }
              />
            </div>
            <InputBase type="hidden" error={ error?.["model_source"]?.[0] }/>
          </div>
          <div className="add-user-modal-form__group">
            <div style={ { display: "flex", flexDirection: "column", gap: 16 } }>
              <Checkpoint
                data={ model }
                onChange={ v => setModel(m => ({ ...m, ...v })) }
                isRequired={ false }
                isProcessing={ savingModel }
              />
            </div>
            <InputBase type="hidden" error={ error?.["checkpoint_source"]?.[0] }/>
          </div>
          <div className="add-user-modal-form__group">
            <InputBase
              label="Config:"
              placeholder="Type something"
              value={ config ?? "" }
              onChange={ e => handleChangeModel({ key: "config", value: e.target.value }) }
              error={ error ? error?.["config"]?.[0] : null }
              isMultipleLine
              disabled={ savingModel }
            />
          </div>
          <div className="add-user-modal-form__group">
            <HtmlEditor
              value={ model_desc }
              onChange={ (content) => handleChangeModel({ key: "model_desc", value: content }) }
              customOptions={ {
                readonly: savingModel,
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
              } }
            />
          </div>
        </div>
      </Modal>
    </Suspense>
  );
};

export default AddModelModal;
