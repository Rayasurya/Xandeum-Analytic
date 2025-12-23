import React, {Dispatch, useEffect, useMemo, useRef, useState} from "react";
import { IconPlus } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import FormActions from "@/components/Form/Actions/Actions";
import FormBuilder from "@/components/Form/Form";
import { extractValue } from "@/components/Form/utils";
import { TCreateStorage, useCreateStorage } from "@/hooks/settings/cloudStorage/useCreateStorage";
import { useGetStorageForm } from "@/hooks/settings/cloudStorage/useGetStorageForms";
import { useGetTypesStorage } from "@/hooks/settings/cloudStorage/useGetTypesStorage";
import {toastError, toastSticky} from "@/utils/toast";
import Select from "@/components/Select/Select";
import {createAlert} from "@/utils/createAlert";
import {infoDialog} from "@/components/Dialog";
import GoogleDriveInstruction from "./GoogleDriveInstruction";

const VALIDATION_RULES_EDIT: {[k: string]: {[k: string]: string}} = {
  s3: {
    title: "Storage Title",
    bucket: "Bucket Name",
    s3_endpoint: "S3 Endpoint",
  },
  gcs: {
    title: "Storage Title",
    bucket: "Bucket Name",
  },
  azure: {
    title: "Storage Title",
    container: "Container Name",
    account_name: "Account Name",
  },
  redis: {
    host: "Host",
    port: "Port",
  },
  gdriver: {
    title: "Storage Title",
    bucket: "Bucket Name",
  },
  localfiles: {
    title: "Storage Title",
    path: "Absolute local path",
  },
}

const VALIDATION_RULES_ADD: {[k: string]: {[k: string]: string}} = {
  s3: {
    ...VALIDATION_RULES_EDIT["s3"],
    aws_access_key_id: "Access Key ID",
    aws_secret_access_key: "Secret Access Key",
  },
  gcs: {
    ...VALIDATION_RULES_EDIT["gcs"],
    google_application_credentials: "Google Application Credentials",
  },
  azure: {
    ...VALIDATION_RULES_EDIT["azure"],
    account_key: "Account Key",
  },
  redis: VALIDATION_RULES_EDIT["redis"],
  gdriver: {
    ...VALIDATION_RULES_EDIT["gdriver"],
    google_application_credentials: "Google Application Credentials",
  },
  localfiles: VALIDATION_RULES_EDIT["localfiles"],
}

export type TStorageFormProps = {
  formId: number;
  target?: string;
  selectedItem?: any;
  closeModal: () => void;
  refetchStorages?: (target: string) => void;
  setIsLoadingForm?: Dispatch<React.SetStateAction<boolean>>;
};

const StorageForm = ({ formId, target, closeModal, refetchStorages, selectedItem, setIsLoadingForm }: TStorageFormProps) => {
  const { loading: storageTypesLoading, storageTypes } = useGetTypesStorage(target && target);
  const { loading: saving, error, onCreateStorage, validationErrors } = useCreateStorage(formId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string>(storageTypes?.[0]?.name ?? "s3");
  if (target === "export" || target === undefined) {
    selectedItem = undefined
  }

  const { storageFormFields, loading: formLoading } = useGetStorageForm(type, target && target, selectedItem);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const isLoading = useMemo(
    () => storageTypesLoading || formLoading || saving || isSubmitting,
    [formLoading, saving, storageTypesLoading, isSubmitting],
  );
  const isEdit = useMemo(() => target === "source_edit" || target === "target_edit", [target]);
  const refError = useRef<HTMLDivElement>(null);

  const handleSubmitForm = async (formData: TCreateStorage) => {
    let payloadData = {...extractValue(formData), storage_type: type};
    const errorFields: string[] = [];
    const validationRules = isEdit ? VALIDATION_RULES_EDIT : VALIDATION_RULES_ADD;

    if ("storage_type" in payloadData && payloadData["storage_type"] in validationRules) {
      const rules = validationRules[payloadData["storage_type"]];
      const fields = Object.keys(rules);

      fields.forEach(f => {
        if (!(f in payloadData) || payloadData[f].trim() === "") {
          errorFields.push(rules[f]);
        }
      });
    }

    if (errorFields.length > 0) {
      toastError("Please enter all necessary field(s): " + errorFields.join(", "));
      return;
    }

    if (selectedItem) {
      // Remove empty password fields for API can partial update storage without modify existing credentials
      storageFormFields.forEach((group: any) => {
        (group.fields ?? []).forEach((field: any) => {
          if (!field || field.type !== "password" || !Object.hasOwn(payloadData, field.name ?? "")) {
            return;
          }

          if (!payloadData[field.name]) {
            delete payloadData[field.name];
          }

          if (typeof payloadData[field.name] !== "string" || payloadData[field.name].length === 0) {
            return;
          }

          // delete payloadData[field.name];
        });
      });
    }

    const closeToast = toastSticky("Validating and saving storage...");
    setIsSubmitting(true);
    setErrorForm(null);

    onCreateStorage(payloadData, type, target && target, selectedItem).promise
      .then(r => {
        if (!r.ok) {
          return;
        }

        refetchStorages?.(target as string);
        closeModal();
      })
      .finally(() => {
        closeToast();
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    if (Object.hasOwn(validationErrors, "non_field_errors")) {
      setErrorForm(validationErrors["non_field_errors"][0]);
    } else if (error) {
      setErrorForm(error);
    }
  }, [error, validationErrors]);

  const fields = useMemo(() => {
    return [
      ...(storageFormFields ?? [])
        .map((section: any) => {
          return {
            ...section,
            fields: (section.fields ?? [])
              .map((field: any) => {
                if (field?.name === "regex_filter") {
                  field = {
                    ...field,
                    placeholder: "",
                    extraContent: (
                      <div style={{marginTop: 8, fontSize: ".85em", opacity: 0.6}}>
                        Only files placed in the <strong>raw_files</strong> folder on your storage will be imported to the system.
                      </div>
                    ),
                  }
                }

                if (!field || field.type !== "password") {
                  return field;
                }

                return {
                  ...field,
                  required: field.required && !selectedItem,
                  placeholder: field.placeholder,
                  // placeholder: selectedItem ? "(unchanged)" : field.placeholder,
                };
              })
          };
        }),
    ];
  }, [selectedItem, storageFormFields]);

  useEffect(() => {
    if (formLoading || storageTypesLoading) {
      setIsLoadingForm?.(true);
    } else {
      setIsLoadingForm?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTypesLoading, formLoading]);

  const storageTypeOptions = React.useMemo(() => storageTypes?.map(({name, title}) => ({
    value: name,
    label: title,
  })) || [], [storageTypes]);

  const selectedStorageType = React.useMemo(() => {
    return storageTypeOptions.find(o => o.value === type);
  }, [storageTypeOptions, type]);

  const errorNode = useMemo(() => errorForm ? (
    <div style={{marginBottom: 32}} ref={refError}>{createAlert(errorForm)}</div>
  ) : null, [errorForm]);

  useEffect(() => {
    if (!errorForm) return;
    refError.current?.parentElement?.parentElement?.scrollTo({top: 0, behavior: "auto"});
  }, [errorForm]);

  return (
    <>
      {errorNode}
      {!isEdit && (
        <div style={{marginBottom: 32}}>
          <Select
            label="Storage Type"
            data={[{options: storageTypeOptions}]}
            defaultValue={selectedStorageType}
            onChange={o => setType(o.value)}
            isLoading={isLoading}
          />
          {type === "gdriver" && (
            <div style={{fontSize: ".9em", marginTop: 8}}>
              <a href="#google-drive" onClick={e => {
                e.preventDefault();
                infoDialog({
                  title: "How to get Google Application Credentials?",
                  message: <GoogleDriveInstruction />,
                });
              }}>Click here</a> to see how to get a Google Application Credentials to access your Google Drive folder.
            </div>
          )}
        </div>
      )}
      <FormBuilder
        fields={fields}
        onSubmit={handleSubmitForm}
      >
        <FormActions>
          <Button
            type="secondary"
            size="small"
            icon={<IconPlus/>}
            className="c-cloud--add"
            htmlType="submit"
            disabled={isLoading}
          >
            {isEdit ? "Save" : "Add"}
          </Button>
        </FormActions>
      </FormBuilder>
    </>
  );
};

export default StorageForm;
