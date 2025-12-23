import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../../components/Button/Button';
import { infoDialog } from '../../../../../components/Dialog';
import InputBase from '../../../../../components/InputBase/InputBase';
import Spin from '../../../../../components/Spin/Spin';
import { useApi } from '../../../../../providers/ApiProvider';
import styles from "../DataSetHubs.module.scss";
import { DATASET_HUB_TYPE } from '../Index';
import { formRenderValidation } from './helper';

export type Field = {
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
};

type TFormRenderProps = {
  type: string;
  fields: Field[];
};

const FormRender = (props: TFormRenderProps) => {
  const { type, fields } = props;
  const [formData, setFormData] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { call } = useApi();
  const params = useParams();
  const projectID = parseInt(params.id ?? "0");
  const navigate = useNavigate();

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const body = useMemo(() => {
    const base = {
      dataset_path: formData?.dataset_path,
      token: formData?.token,
    }
    switch (type) {
      case DATASET_HUB_TYPE.huggingface:
        return base;
      case DATASET_HUB_TYPE.roboflow:
        return {
          ...base,
          workspace: formData?.workspace,
          version: formData?.version
        }
      case DATASET_HUB_TYPE.kaggle:
        return {
          username: formData?.username,
          ...base,
        }
      default:
        return {
          url: formData?.url,
          token: formData?.token,
        };
    }
  }, [type, formData]);

  const onImport = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const hasError = formRenderValidation(formData, fields, setError);
      if (hasError) return;

      try {
        setError(null);
        setLoading(true);

        const ar = call("importDataset", {
          body: {
            type_dataset: type,
            project_id: projectID,
            ...body,
          },
        });

        ar.promise.then(async (res) => {
          const result = await res.json();
          if (res.ok) {
            infoDialog({ message: "Import data successfully", className: "form-dataset mgs-success" });
            navigate("/projects/" + projectID + `/data?tab=1`);
          }
          if (result?.status_code === 400) {
            infoDialog({ message: result?.validation_errors, className: "form-dataset mgs-error", title: "Error" });
          }
          if (result?.status_code === 500) {
            infoDialog({ message: result?.detail, className: "form-dataset mgs-error", title: "Error" });
          }
          if (result?.error) {
            infoDialog({ message: result?.error, className: "form-dataset mgs-error", title: "Error" });
          }
        })
          .finally(() => {
            setLoading(false);
            setFormData(null);
          });
      } catch (error) {
        const err = error instanceof Error ? error.message : "Something when wrong!";
        infoDialog({ message: err });
        setLoading(false);
      }
    },
    [fields, formData, call, type, body, projectID, navigate]
  );

  useEffect(() => {
    if (error) {
      infoDialog({ message: error, className: "form-dataset mgs-warning", title: "Dataset Hubs" });
    }
    return () => {
      setError(null);
    };
  }, [error]);

  useEffect(() => {
    if (type) {
      setFormData(null);
      setError(null);
    }
  }, [type]);

  return (
    <form onSubmit={onImport}>
      {fields.map((field) => (
        <div key={field.name}>
          <InputBase
            label={field.label}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            allowClear={false}
            type={field.name === "token" ? "password" : "text"}
            value={formData?.[field.name] ?? ""}
          />
        </div>
      ))}
      <div className={styles.DatasetHubsAction}>
        <Button
          className={styles.DatasetHubsActionImport}
          htmlType="submit"
        >
          {loading ? <Spin loading={loading} /> : "Import Dataset Hubs"}
        </Button>
      </div>
    </form>
  );
};

export default FormRender;
