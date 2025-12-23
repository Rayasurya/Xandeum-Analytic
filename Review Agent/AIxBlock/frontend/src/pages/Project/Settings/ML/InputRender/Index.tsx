import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import InputBase from '../../../../../components/InputBase/InputBase';
import Select, { DataSelect, SelectOption } from '../../../../../components/Select/Select';
import { TModelMarketplaceSell } from '../../../../../hooks/modelsSeller/useGetModelMarketplaceListSell';
import { IAddModelData } from '../ML';
import { validateDockerImageFormat, validateGitHubUrl } from '../helper';

export type Field = {
  name: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
};

export type TModelData = IAddModelData & { price_per_hours?: number, catalog_id?: string, auto_provision?: boolean }

type TInputRenderProps = {
  title: string;
  type: string;
  setType: Dispatch<SetStateAction<string | null>>,
  fields: Field[];
  onFieldChange?: (field: string, value: string | SelectOption[] | number | boolean | File) => void;
  dataSelect: DataSelect[];
  addModelData?: IAddModelData | TModelMarketplaceSell;
  setAddModelData?: Dispatch<SetStateAction<TModelData>>;
  currentField: string | null;
  defaultValue?: SelectOption | SelectOption[] | null;
  isRequired?: boolean;
  setIsInValid?: Dispatch<SetStateAction<boolean>>;
};

const InputRender = (props: TInputRenderProps) => {
  const {
    title,
    fields,
    type,
    onFieldChange,
    dataSelect,
    setType,
    addModelData,
    setAddModelData,
    currentField,
    defaultValue,
    isRequired,
    setIsInValid,
  } = props;

  const [error, setError] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    if (type) {
      switch (true) {
        case type === "model_source" &&
          (currentField === "HUGGING_FACE" ||
            currentField === "ROBOFLOW" ||
            currentField === "GIT" ||
            currentField === "DOCKER_HUB"):
          setAddModelData?.({
            ...addModelData,
            model_token: "",
            model_id: "",
            docker_image: "",
            docker_access_token: ""
          } as TModelData);
          break;
        default:
          setAddModelData?.({
            ...addModelData,
            checkpoint_id: "",
            checkpoint_token: ""
          } as TModelData);
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, currentField]);

  const validateField = (field: Field, value: string) => {
    let errorMsg = "";

    const isGitInvalid = currentField === "GIT" && (field.name === "model_id" || field.name === "checkpoint_id") &&
      !validateGitHubUrl(value) &&
      value.length > 0;

    const isDockerInvalid = currentField === "DOCKER_HUB" &&
      field.name === "model_id" &&
      validateDockerImageFormat(value) &&
      value.length > 0;

    if (isGitInvalid) {
      errorMsg = "Invalid format for GitHub url!";
    } 
    if (isDockerInvalid) {
      errorMsg = "Invalid format for Docker image!";
    }
    
    if (value.length === 0) {
      setIsInValid?.(true);
    }

    if (value.length > 0 && 
      (isGitInvalid || isDockerInvalid) && 
      (field.name === "model_id" || field.name === "checkpoint_id" || field.name === "docker_image")) 
      {
      setIsInValid?.(true);
    } 

    if (value.length > 0 && 
      (!isGitInvalid && !isDockerInvalid) && 
      (field.name === "model_id" || field.name === "checkpoint_id" || field.name === "docker_image")) 
      {
      setIsInValid?.(false);
    }

    setError((prevError) => ({ ...prevError, [field.name]: errorMsg }));
  };

  useEffect(() => {
    if (currentField) {
      setError(null);
      setIsInValid?.(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentField]);

  return (
    <div className="c-model-preview__row flex-col">
      <div className="c-model-preview__row">
        <div className="c-model-preview__input-column">
          <label className="c-add-model__item__label">{title}{isRequired ? <span className="required">*</span> : null}</label>
          <Select
            className={"c-add-model__select"}
            data={dataSelect}
            onChange={(val) => {
              onFieldChange?.(type, val.value);
              setType(val.value);
            }}
            placeholderText={"Select"}
            defaultValue={defaultValue}
          />
        </div>
      </div>
      {type &&
        <div className="c-model-preview__row justify">
          {fields.map((field) => (
            <div className="c-model-preview__input-column" key={field.name}>
              <InputBase
                value={addModelData?.[field.name as keyof (IAddModelData | TModelMarketplaceSell)] ?? ""}
                label={field.label}
                placeholder={field.placeholder}
                onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                allowClear={false}
                isRequired={field.isRequired}
                type={
                  field.name === "docker_access_token" ||
                    field.name === "model_token" ||
                    field.name === "checkpoint_token" ? "password" : "text"
                }
                onBlur={(e) => validateField(field, e.target.value)}
                disabled={!currentField}
              />
              {error?.[field.name] && <span className="c-model-preview__input--error">{error?.[field.name]}</span>}
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default InputRender;
