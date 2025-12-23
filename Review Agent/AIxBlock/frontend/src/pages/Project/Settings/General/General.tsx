import { memo, useCallback, useEffect, useMemo, useState } from "react";
import InputBase from "@/components/InputBase/InputBase";
import Select, { SelectOption } from "@/components/Select/Select";
import {useCreateProject} from "@/hooks/project/create/useCreateProject";
import { useGetDataTemplatesGpu } from "@/hooks/settings/general/useGetDataTemplatesGpu";
import LayoutSettings from "../LayoutSettings/Index";
import "./General.scss";
import { TProjectModel } from "@/models/project";
import { COLOR_LIST, GENERAL_ENUM } from "../LayoutSettings/constants";
import Checkbox from "@/components/Checkbox/Checkbox";
import { isCreateStep } from "../LayoutSettings/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { createAlert } from "@/utils/createAlert";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import Button from "@/components/Button/Button";

type TGeneralProps = {
  data?: TProjectModel | null;
  setOnNext?: (cb: Function | null) => void;
  refetch?: () => void;
};

const General = memo(({ data, setOnNext, refetch }: TGeneralProps) => {
  const {
    templates: apiTemplates,
    loading: loadingTemplates,
    configList,
    error: loadingError,
    refresh: refreshAnnotation,
  } = useGetDataTemplatesGpu();
  const location = useLocation();
  const navigate = useNavigate();

  const isMCE = useMemo(() => (data?.label_config ?? "").startsWith('<View id="llm-custom"'), [data?.label_config]);

  const templates = useMemo(() => {
    return apiTemplates.concat([
      { label: "Multimodal Custom Editor", value: "llm_custom", options: [] },
    ]);
  }, [apiTemplates]);

  const initialGeneralData = useMemo(() => {
    const initialData: Partial<TProjectModel> = {
      title: data?.title ? data?.title : "",
      color: data?.color ?? COLOR_LIST[0].color ?? "#888888",
      label_config: data?.label_config ?? "",
      label_config_title: data?.label_config_title ?? "",
      annotation_template: 0,
      type: { label: "Select type", value: "" },
      epochs: 1,
      batch_size: 1,
      image_width: 64,
      image_height: 64,
    };

    return initialData;
  }, [data]);

  const [generalData, setGeneralData] = useState<Partial<TProjectModel>>(initialGeneralData);

  const { error, loading, validationErrors, onCreate } = useCreateProject(generalData);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      if (field === "type") {
        if (value === "llm_custom") {
          setGeneralData((ps) => ({
            ...ps,
            label_config: '<View id="llm-custom"><!----></View>',
            annotation_template: 0,
            type: {label: value, value: value},
            // label_config_title: "Multimodal Custom Editor",
          }));
        } else {
          const template_id = parseInt(value);
          let template_name = "";

          templates.forEach(tg => {
            tg.options.forEach(t => {
              if (t.value !== value) {
                return;
              }

              template_name = t.label;
            })
          });

          setGeneralData((ps) => ({
            ...ps,
            label_config: configList[template_id],
            annotation_template: template_id,
            label_config_title: template_name,
            template_id,
            type: {
              label: value,
              value: value,
            },
          }));
        }
      } else {
        setGeneralData((ps) => ({ ...ps, [field]: value }));
      }
    },
    [configList, templates]
  );

  const getLabelSelected = useMemo(() => {
    let val: SelectOption | null = null;
    templates.forEach((category) => {
      let selected = category.options.find(
        (option) => option.value === generalData.type?.value
      );
      if (!selected)
        selected =
          category.value === generalData.type?.value
            ? {
                label: category.label ?? "",
                value: category.value ?? "",
                data: category.data,
              }
            : undefined;

      if (selected) {
        val = { label: selected.label ?? "", value: selected.value ?? "" };
      }
    });
    return val;
  }, [generalData.type, templates]);

  const onSubmitGeneral = useCallback(() => {
    onCreate(data?.id).then(() => {
      if (isCreateStep(location)) {
        return;
      }
      refetch?.();
    });
  }, [onCreate, refetch, data?.id, location]);

  useEffect(() => {
    if (!setOnNext) {
      return;
    }

    setOnNext(onCreate);

    return () => {
      setOnNext(null);
    };
  }, [setOnNext, onCreate]);

  const errorNode = useMemo(() => {
    return createAlert(error, undefined, false);
  }, [error]);

  if (loadingError) {
    return <div className="c-general m-229 loading-error">
      <EmptyContent message={loadingError} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refreshAnnotation(),
        }
      ]} />
    </div>
  }

  return (
    <div className="c-content-settings">
      <div className="c-general m-303">
        <div>
          {errorNode}
          <h4 className="c-general__heading">1_General</h4>
          <div className="c-general__section">
            <div className="c-general__section-item">
              <InputBase
                key={`key-input-${data?.title}`}
                className="c-general__field"
                label="Project name"
                placeholder="Type your project name"
                disabled={loading}
                onChange={(e) =>
                  handleFieldChange(GENERAL_ENUM.title, e.target.value)
                }
                allowClear={false}
                value={data?.title ?? ""}
                isRequired
                error={
                  Object.hasOwn(validationErrors, "title")
                    ? validationErrors["title"][0]
                    : null
                }
              />
              {!data?.id && (
                <Select
                  key={`key-select-${data?.sampling}`}
                  label="Types"
                  data={templates}
                  onChange={(value) =>
                    handleFieldChange(GENERAL_ENUM.type, value.value)
                  }
                  isSelectGroup
                  isLoading={loadingTemplates}
                  defaultValue={
                    getLabelSelected ?? { label: "Select type", value: "" }
                  }
                  error={
                    Object.hasOwn(validationErrors, "label_config")
                      ? validationErrors["label_config"][0]
                      : null
                  }
                />
              )}
              {isMCE && (
                <Button
                  type="gradient"
                  size="small"
                  onClick={() => {
                    navigate("/projects/" + (data?.id ?? "0") + "/editor-designer")
                  }}
                  style={{
                    minWidth: "auto",
                    transform: "translateY(22px)",
                    width: 210,
                  }}
                >
                  Design Editor UI
                </Button>
              )}
            </div>
          </div>
          <div className="c-general__section flex-col">
            <label className="c-select__label">Color</label>
            <div className="c-radio__list">
              {COLOR_LIST?.map((item) => (
                <div
                  className={`c-radio__item ${item.name}`}
                  key={`key-color-${item.name}`}
                >
                  <input
                    key={`key-color-${data?.color}`}
                    type="radio"
                    id={item.color}
                    name={item.name}
                    value={item.value}
                    checked={(generalData?.color || data?.color) === item.value}
                    onChange={(e) =>
                      handleFieldChange(GENERAL_ENUM.color, e.target.value)
                    }
                  />
                  <span
                    className={`c-radio__checkmark`}
                    style={{ background: item.color }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="c-general__section flex-col task-sampling">
            <label className="c-select__label">Task Sampling:</label>
            <div className="c-task-sampling__radio-option">
              <Checkbox
                size="sm"
                label="Sequential sampling Tasks are ordered by Data manager ordering"
              />
            </div>
            <div className="c-task-sampling__radio-option">
              <Checkbox
                size="sm"
                label="Random sampling. Tasks are chosen with uniform random"
              />
            </div>
          </div>
        </div>
      </div>
      <LayoutSettings.Footer
				onNext={() => onSubmitGeneral()}
        onSkip={() =>
          isCreateStep(location)
            ? undefined
            : navigate("/projects/" + data?.id + `/settings/ml`)
        }
      />
    </div>
  );
});

export default General;
