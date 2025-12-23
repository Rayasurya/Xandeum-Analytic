import React, { memo, useCallback, useMemo, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { useApi } from "@/providers/ApiProvider";
import { STATUS_COMPUTE } from "@/constants/projectConstants";
import { createAlert } from "@/utils/createAlert";

type TAddOrgFormProps = {
  data?: any | null;
  type: string;
  active_org?: number;
  refetch: () => Promise<void>;
  onClose: () => void;
};

const MemoizedAddCataModelForm = (props: TAddOrgFormProps) => {
  const { data, type = "ADD", refetch, onClose } = props;
  const [validationErrors, setValidationErrors] = useState<{
    [k: string]: string[];
  }>({});
  const [error, setError] = useState<null | string>(null);
  const [dataComp, setDataComp] = useState<any>({
    name: data?.name,
    status: data?.status,
  });
  const api = useApi();

  const onChangeField = (field: string, val: string) => {
    const update: any = {
      ...dataComp,
      [field]: val,
    };
    update && setDataComp(update);
  };

  const currentStatus = useMemo(() => {
    return (
      STATUS_COMPUTE[0].options.find(
        (item) => item.value === dataComp?.status
      ) ?? null
    );
  }, [dataComp]);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (type === "UPDATE") {
        api
          .call("updateCataModel", {
            params: { id: data.id.toString() },
            body: dataComp,
          })
          .promise.then(async(res) => {
            const result = await res.json();
            if (res.ok) {
              refetch();
              onClose();
            }
            
            if (Object.hasOwn(result, "validation_errors")) {
              setValidationErrors(result["validation_errors"]);
            }

            if (Object.hasOwn(result, "detail")) {
              setError(result["detail"]);
            }
            return false;
          });
      } else {
        setDataComp(null);
        api
          .call("createCataModel", {
            body: dataComp,
          })
          .promise.then(async (res) => {
            const result = await res.json();
            if (res.ok) {
              refetch();
              onClose();
            }

            if (Object.hasOwn(result, "validation_errors")) {
              setValidationErrors(result["validation_errors"]);
            }

            if (Object.hasOwn(result, "detail")) {
              setError(result["detail"]);
            }

            return false;
          });
      }
    },
    [data, dataComp, type, api, onClose, refetch]
  );

  const errorNode = React.useMemo(() => {
    return createAlert(error, undefined, false);
  }, [error]);
  
  return (
    <div className="c-org-form">
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="c-org-form__content">
          {errorNode}
          <div className="c-org-form__top">
            <InputBase
              isRequired={true}
              className="c-org-form__input"
              label="Catalog name"
              placeholder="Type name Catalog"
              value={data?.name ? data?.name : ""}
              allowClear={false}
              onChange={(e) => onChangeField("name", e.target.value)}
              error={
                Object.hasOwn(validationErrors, "name")
                  ? validationErrors["name"][0]
                  : null
              }
            />
            {type === "ADD" && (
              <InputBase
                className="c-org-form__input"
                label="Tag"
                placeholder="Type tag"
                value={data?.tag ? data?.tag : ""}
                allowClear={false}
                onChange={(e) => onChangeField("tag", e.target.value)}
                error={
                  Object.hasOwn(validationErrors, "tag")
                    ? validationErrors["tag"][0]
                    : null
                }
              />
            )}
            <Select
              className="c-org-form__select"
              label="Status"
              data={STATUS_COMPUTE}
              onChange={(val) => onChangeField("status", val.value)}
              defaultValue={
                currentStatus ? currentStatus : STATUS_COMPUTE[0].options[0]
              }
              error={
                Object.hasOwn(validationErrors, "status")
                  ? validationErrors["status"][0]
                  : null
              }
            />
          </div>
        </div>
        <div className="c-org-form__action">
          <Button
            htmlType="submit"
            className="c-org-form__action--add"
            icon={<IconPlus />}
          >
            {type === "UPDATE" ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const AddCataModeForm = memo(MemoizedAddCataModelForm);

export default AddCataModeForm;
