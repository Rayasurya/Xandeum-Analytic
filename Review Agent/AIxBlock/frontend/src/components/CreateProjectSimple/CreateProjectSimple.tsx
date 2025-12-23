import { TProjectModel } from "@/models/project";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetDataTemplatesGpu } from "@/hooks/settings/general/useGetDataTemplatesGpu";
import Select from "../Select/Select";
import styles from "./CreateProjectSimple.module.scss";
import { getDefaultProjectData } from "@/pages/Flow/defaultProjectData";
import InputBase from "../InputBase/InputBase";
import { useApi } from "@/providers/ApiProvider";
import { toastError, toastSticky } from "@/utils/toast";
import { extractErrorMessage } from "@/utils/error";
import { getPredictTask } from "@/utils/models";

export type TProps = {
  onCreated?: (project: TProjectModel) => void;
  registerTrigger?: (callback: Function) => void;
  limitTasks?: string[];
}

export default function CreateProjectSimple({ onCreated, registerTrigger, limitTasks }: TProps) {
  const { templates, loading: loadingTemplates, configList } = useGetDataTemplatesGpu();
  const [ errors, setErrors ] = useState<{ [k: string]: string }>({});
  const [ isCreating, setIsCreating ] = useState(false);
  const { call } = useApi();

  const data = useRef<{
    title: string,
    config: string,
    configTitle: string,
    annotationTemplateId: number,
    flow: Exclude<TProjectModel["flow_type"], "train-and-deploy" | undefined>,
  }>({
    title: "",
    config: "",
    configTitle: "",
    annotationTemplateId: 0,
    flow: null,
  });

  const hasError = useCallback(() => {
    let result = false;
    setErrors({});

    if (data.current.title?.trim().length === 0) {
      result = true;
      setErrors(errs => ({ ...errs, title: "Please enter project name" }));
    }

    if (data.current.config?.trim().length === 0) {
      result = true;
      setErrors(errs => ({ ...errs, type: "Please select project type" }));
    }

    if (!data.current.flow) {
      result = true;
      setErrors(errs => ({ ...errs, flow: "Please select a flow" }));
    }

    return result;
  }, []);

  const createProject = useCallback(async () => {
    if (hasError() || isCreating) {
      return;
    }

    let success = false;
    const payload = getDefaultProjectData(data.current);
    const closeToast = toastSticky("Creating new project...", { toastId: "creatingProject" });
    const ar = call('createProjects', {
      body: payload,
    });

    try {
      const res = await ar.promise;

      if (res.ok) {
        onCreated?.(await res.json());
        success = true;
      }
    } catch (e) {
      toastError(extractErrorMessage(e));
    }

    closeToast();
    setIsCreating(false);
    return success;
  }, [call, hasError, isCreating, onCreated]);

  useEffect(() => {
    registerTrigger?.(createProject);
  }, [ createProject, registerTrigger ]);

  const filteredTemplates = useMemo(() => {
    return templates
      .map(group => {
        return {
          ...group,
          options: group.options.filter(opt => {
            return (limitTasks ?? []).includes(getPredictTask(opt.label));
          }),
        };
      })
      .filter(group => group.options.length > 0);
  }, [limitTasks, templates]);

  return (
    <div className={ styles.container }>
      <InputBase
        isRequired={true}
        onChange={e => data.current.title = e.currentTarget.value}
        value={data.current.title}
        label="Project Name"
        error={errors?.["title"]}
        isLoading={isCreating}
      />
      <Select
        label="Type"
        isRequired={ true }
        isSelectGroup={ true }
        data={ filteredTemplates }
        isLoading={ loadingTemplates }
        onChange={ o => {
          data.current.config = configList[Number(o.value)] ?? "";
          data.current.configTitle = o.label;
          data.current.annotationTemplateId = Number(o.value);
          hasError();
        } }
        error={errors?.["type"]}
        disabled={isCreating}
      />
      <Select
        label="I want to"
        isRequired={ true }
        isCreatePortal={ true }
        data={ [ {
          options: [
            {
              label: "Fine-Tune and Deploy",
              value: "fine-tune-and-deploy",
              data: "If you want to Fine-tune pre-trained models, whether its your own model, or from model hubs like HF or Roboflow, or rent from our model marketplace, select this.",
            },
            {
              label: "Deploy Only",
              value: "deploy",
              data: "Deploy models or set up API inference endpoints using your uploaded models, or our decentralized model marketplace, or models from other hubs. We support nearly all popular foundation models.",
            },
            {
              label: "Label & Validate Data",
              value: "label-and-validate-data",
              data: "If you only need to label data, validate data, or validate the output of a model, select this option.",
            },
          ],
        } ] }
        onChange={ o => {
          data.current.flow = o.value as typeof data.current.flow;
          hasError();
        }}
        className={ styles.flow }
        customRenderLabel={ o => (
          <div className={ styles.flowItem }>
            <div className={ styles.flowItemName }>{ o.label }</div>
            <div className={ styles.flowItemDesc }>{ o.data }</div>
          </div>
        ) }
        error={errors?.["flow"]}
        disabled={isCreating}
      />
    </div>
  );
}
