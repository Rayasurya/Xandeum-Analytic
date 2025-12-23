import { Dispatch, SetStateAction } from "react";
import InputBase from "@/components/InputBase/InputBase";
import Select, { DataSelect, SelectOption } from "@/components/Select/Select";
import "./index.scss";
import Checkbox from "@/components/Checkbox/Checkbox";
import HtmlEditor from "@/components/HtmlEditor/HtmlEditor";
import Switch from "@/components/Switch/Switch";
import Upload from "@/components/Upload/Upload";
import Button from "@/components/Button/Button";

type TAddModelFormProps<K> = {
  dataModel?: K;
  validationErrors?: {
    [k: string]: string[]
  }
  loadingModelCatalog?: boolean;
  modelCatalogList?: DataSelect[];
  setDataModel?: Dispatch<SetStateAction<K>>;
  defaultModelTypeValue?: () => SelectOption | SelectOption[] | null;
}

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
    ],
  },
];

const AddModelForm = <K,>(props: TAddModelFormProps<K>) => {
  const {
    dataModel,
    validationErrors,
    loadingModelCatalog,
    modelCatalogList,
    defaultModelTypeValue
  } = props;

  const handleChangeItem = (
    key: keyof K,
    value: string | number | boolean | File
  ) => {
    console.log(key, value);
  };

  return (
    <div className="c-add-model form">
      <form className="content">
        <div className="c-add-model__group">
          <InputBase
            label="Title"
            placeholder="Type..."
            onChange={(e) => handleChangeItem("name" as keyof K, e.target.value)}
            value={(dataModel as any)?.name}
            error={
              validationErrors && Object.hasOwn(validationErrors, "name")
                ? validationErrors?.["name"][0]
                : null
            }
          />
          <Select
            label="Model Type"
            defaultValue={defaultModelTypeValue?.()}
            data={modelCatalogList ?? []}
            className="c-ml__select-model"
            isLoading={loadingModelCatalog}
          />
        </div>
        <div className="c-add-model__group gray">
          <div className="p-16 full">
            <div className="c-add-model__row justify full mb-24">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Select computes</label>
                <Select
                  className={"c-add-model__select"}
                  data={dataFramework}
                />
              </div>
            </div>
            <div className="c-add-model__row justify full mb-24">
              <div className="c-add-model__item" key="params">
                <span className="c-add-model__item__label">Params:</span>
                <InputBase
                  value={""}
                  allowClear={false}
                  placeholder="..."
                  type="number"
                  validateNonNegativeInteger={true}
                />
                <span className="available">%s</span>
              </div>
              <div className="c-add-model__item" key="flops">
                <span className="c-add-model__item__label">FLOPs:</span>
                <div className="c-add-model__item__input-number h-40 lead-40">
                  <span>{"-"}</span>
                  <span className="available">TFLOPs</span>
                </div>
              </div>
              <div className="c-add-model__item" key="gpu-mem">
                <span className="c-add-model__item__label">GPU Mem:</span>
                <div className="c-add-model__item__input-number h-40 lead-40">
                  <span>{"..."}</span>
                  <span className="available">%s</span>
                </div>
              </div>
            </div>
            <div className="c-add-model__row">
              <div className="auto-provision">
                <Switch checked={false} label="Auto Provision?" />
              </div>
            </div>
          </div>
        </div>
        <div className="c-add-model__group">
          <div className="c-add-model__group gray mb-0">
            <div className="p-16 full">
              <div className="c-add-model__row justify mb-24">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Model Source</label>
                  <Select
                    className={"c-add-model__select"}
                    data={dataFramework}
                  />
                </div>
              </div>
              <div className="c-add-model__row justify">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Model ID</label>
                  <InputBase
                    value=""
                    allowClear={false}
                    className=""
                    placeholder="Type here"
                  />
                </div>
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">{`Token (If private)`}</label>
                  <InputBase
                    value=""
                    allowClear={false}
                    className=""
                    placeholder="Type here"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="c-add-model__group gray mb-0">
            <div className="p-16 full">
              <div className="c-add-model__row justify mb-24">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Checkpoint</label>
                  <Select
                    className={"c-add-model__select"}
                    data={dataFramework}
                  />
                </div>
              </div>
              <div className="c-add-model__row justify">
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">Model ID</label>
                  <InputBase
                    value=""
                    allowClear={false}
                    className=""
                    placeholder="Type here"
                  />
                </div>
                <div className="c-add-model__input-column">
                  <label className="c-add-model__item__label">{`Token (If private)`}</label>
                  <InputBase
                    value=""
                    allowClear={false}
                    className=""
                    placeholder="Type here"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="c-add-model__group">
          <div className="p-16 full">
            <div className="c-add-model__input-column">
              <label className="c-add-model__item__label">Upload your sample dataset to have a trial training</label>
              <Upload
                name="csv_file"
                accept="image/*"
                describe="sample dataset for trial"
              />
            </div>
          </div>
        </div>
        <div className="c-add-model__group">
          <InputBase
            label="Sequence token length"
            placeholder="Type number"
            value={""}
          />
          <div className="flex item-center gap-24">
            <InputBase
              label="Sampling frequency"
              placeholder="Type number"
              value={""}
              className="w-50-12"
            />
            <div className="group mono w-50-12 flex flex-col gap-4">
              <label className="c-add-model__item__label">Mono:</label>
              <div className="flex item-center gap-16 h-40">
                <Checkbox
                  size="sm"
                  label="True"
                />
                <Checkbox
                  size="sm"
                  label="False"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="c-add-model__group">
          <div className="p-16 full">
            <div className="c-add-model__input-column">
              <label className="c-add-model__item__label">Framework: </label>
              <Select
                className={"c-add-model__select"}
                data={dataFramework}
              />
            </div>
          </div>
        </div>

        <div className="c-add-model__group gray">
          <div className="p-16 full">
            <div className="c-add-model__row justify mb-24">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Epochs:</label>
                <InputBase
                  value=""
                  allowClear={false}
                  className=""
                  placeholder="Enter epochs"
                  type="number"
                />
              </div>
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Batch Size:</label>
                <InputBase
                  value=""
                  allowClear={false}
                  className=""
                  placeholder="Enter batch size"
                  type="number"
                />
              </div>
            </div>
            <div className="c-add-model__row justify mb-24">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Batch size per Epochs:</label>
                <InputBase
                  value=""
                  allowClear={false}
                  className=""
                  placeholder="Enter Batch size per epochs"
                  type="number"
                />
              </div>
            </div>
            <div className="c-add-model__row justify">
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Accuracy:</label>
                <InputBase
                  value=""
                  allowClear={false}
                  className=""
                  placeholder="Enter accuracy"
                  type="number"
                />
              </div>
              <div className="c-add-model__input-column">
                <label className="c-add-model__item__label">Precision: </label>
                <Select
                  className="c-add-model__select"
                  data={dataPrecision}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="c-add-model__input-column mb-24">
          <div className="c-add-model__item__label">Model Descriptions</div>
          <HtmlEditor
            value={""}
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
                value={""}
                allowClear={false}
                placeholder="..."
                type="number"
                validateNonNegativeInteger={true}
              />
              <span className="available">$/hr</span>
            </div>
          </div>
        </div>
        <div className="c-add-model__group">
          <div className="full">
            <div className="flex flex-col gap-6">
              <Checkbox
                size="sm"
                label="Sequential sampling Tasks are ordered by Data manager ordering"
              />
              <Checkbox
                size="sm"
                label="Random sampling. Tasks are chosen with uniform random"
              />
            </div>
          </div>
        </div>
        <div className="c-add-model__action">
          <Button className="c-add-model__action--cancel" type="secondary">Cancel</Button>
          <Button className="c-add-model__action--add">Add</Button>
        </div>
      </form>
    </div>
  )
}

export default AddModelForm;
