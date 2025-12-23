import {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import FormActions from "@/components/Form/Actions/Actions";
import FormBuilder from "@/components/Form/Form";
import {
  TCreateStorage,
  useCreateStorage,
} from "@/hooks/settings/cloudStorage/useCreateStorage";
import {useGetTypesStorage} from "@/hooks/settings/cloudStorage/useGetTypesStorage";
import "./StorageForm.scss";
import {useGetStorageForm} from "@/hooks/settings/cloudStorage/useGetStorageForms";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {extractValue} from "@/components/Form/utils";

export type TStorageFormProps = {
  formId: number;
  target?: string;
  closeModal?: () => void;
  refetchStorages: (target: string) => void;
  selectedItem?: any;
  setIsLoadingForm: Dispatch<React.SetStateAction<boolean>>;
};

const StorageForm = ({formId, target, closeModal, refetchStorages, selectedItem, setIsLoadingForm}: TStorageFormProps) => {
  const {loading: storageTypesLoading, storageTypes} = useGetTypesStorage(target && target);
  const {loading: saving, error, onCreateStorage, validationErrors} = useCreateStorage(
    formId
  );
  const [type, setType] = useState<string>(storageTypes?.[0]?.name ?? "s3");
  if(target==="export" || target===undefined){
    selectedItem = undefined
  }
  const {storageFormFields, loading: formLoading} = useGetStorageForm(type, target && target, selectedItem);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  useBooleanLoader(storageTypesLoading || formLoading || saving, "Processing...");
  const storageTypeSelect = useMemo(() => {
    return {
      columnCount: 1,
      fields: [
        {
          skip: true,
          type: "select",
          name: "storage_type",
          label: "Storage Type",
          disabled: !!storageTypes,
          options:
            storageTypes?.map(({name, title}) => ({
              value: name,
              label: title,
            })) || [],
          onChange: async (value: SetStateAction<string>) => {
            setType(value);
            setErrorForm(null);
          },
        },
      ],
    };
  }, [storageTypes, setType]);

  const handleSubmitForm = async (formData: TCreateStorage) => {
    let payloadData = extractValue(formData);

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

          delete payloadData[field.name];
        });
      });
    }

    onCreateStorage(payloadData, type, target && target, selectedItem).promise
      .then(r => {
        if (!r.ok) {
          return;
        }

        refetchStorages(target as string);
        closeModal?.();
      });
  };

  // useEffect(() => {
  //   if (error === null && !loading && Object.keys(storageData).length > 0) {
  //     refetchStorages(target as string);
  //     closeModal?.();
  //   }
  // }, [storageData, loading, target, error, refetchStorages, closeModal]);

  useEffect(() => {
    if (Object.hasOwn(validationErrors, "non_field_errors")) {
      setErrorForm(validationErrors["non_field_errors"][0]);
    } else if (error) {
      setErrorForm(error);
    }
  }, [error, validationErrors]);
  
  const fields = useMemo(() => {
    return [
      storageTypeSelect,
      ...(storageFormFields ?? [])
        .map((section: any) => {
          return {
            ...section,
            fields: (section.fields ?? [])
              .map((field: any) => {
                if (!field || field.type !== "password") {
                  return field;
                }

                return {
                  ...field,
                  required: field.required && !selectedItem,
                  placeholder: selectedItem ? "(unchanged)" : field.placeholder,
                };
              })
          };
        }),
    ];
  }, [selectedItem, storageFormFields, storageTypeSelect]);

  useEffect(() => {
    if (formLoading || storageTypesLoading) {
      setIsLoadingForm(true);
    } else {
      setIsLoadingForm(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageTypesLoading, formLoading]);

  return (
    <FormBuilder
      fields={fields}
      onSubmit={handleSubmitForm}
      error={errorForm}
    >
      <FormActions>
        <Button
          type="secondary"
          size="small"
          icon={<IconPlus/>}
          className="c-cloud--add"
          htmlType="submit"
        >
          {target === "source_edit" || target === "target_edit" ? "Save" : "Add"}
        </Button>
      </FormActions>
    </FormBuilder>
  );
};

export default StorageForm;
