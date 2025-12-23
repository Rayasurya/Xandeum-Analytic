import React, { memo, useCallback, useMemo, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { useApi } from "@/providers/ApiProvider";
import { STATUS_COMPUTE } from "@/constants/projectConstants";
import Alert from "@/components/Alert/Alert";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import { TCatalogCompute } from "@/models/catalogCompute";

type TAddOrgFormProps = {
  data?: TCatalogCompute;
  type: string;
  refetch: () => Promise<void>;
  onClose: () => void;
};

const MemoizedAddCataCompForm = (props: TAddOrgFormProps) => {
  const { data, type = "ADD", refetch, onClose } = props;
  const [dataComp, setDataComp] = useState({
    name: data?.name,
    tag: data?.tag,
    status: data?.status ?? STATUS_COMPUTE[0].options[0].value,
  });
  const api = useApi();
  const { addPromise } = usePromiseLoader();
  const [validationErrors, setValidationErrors] = useState<{[k:string]: string[]}>({});
  const [error, setError] = useState("");

  const onChangeField = (field: string, val: string) => {
    const update = {
      ...dataComp,
      [field]: val,
    };
    update && setDataComp(update);
  };

  const currentStatus = useMemo(() => {
    return (
      STATUS_COMPUTE[0].options.find((item) => item.value === dataComp?.status)
    );
  }, [dataComp]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const ar = api.call(type === "UPDATE" ? "updateCataCompute" : "createCataCompute", {
        params: type === "UPDATE" ? { id: data!.id.toString() } : {},
        body: dataComp,
      });

      addPromise(ar.promise, "Saving catalog...");

      ar.promise
      .then(async r => {
        if (r.ok) {
          refetch();
          onClose();
          return;
        }

        const data = await r.json();

        if (Object.hasOwn(data, "validation_errors")) {
          setValidationErrors(data.validation_errors);
        }

        if (Object.hasOwn(data, "detail")) {
          setError(data.detail);
        } else {
          setError(r.statusText);
        }
      });
    },
    [dataComp, type, api, data, onClose, refetch, addPromise]
  );

  const errorNode = React.useMemo(() => {
    if (!error) {
      return null;
    }

    return (
      <Alert
        message={error}
        type="Danger"
        style={{ marginBottom: 16 }}
      />
    );
  }, [error]);

  return (
    <div className="c-org-form">
      {errorNode}
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="c-org-form__content">
          <div className="c-org-form__top">
            <InputBase
              className="c-org-form__input"
              label="Catalog name"
              placeholder="Type name catalog"
              value={dataComp?.name}
              allowClear={false}
              onChange={(e) => onChangeField("name", e.target.value)}
              error={Object.hasOwn(validationErrors, "name") ? validationErrors["name"][0] : null}
            />
            {type === "ADD" && (
              <InputBase
                className="c-org-form__input"
                label="Tag"
                placeholder="Type tag"
                value={dataComp?.tag}
                allowClear={false}
                onChange={(e) => onChangeField("tag", e.target.value)}
                error={Object.hasOwn(validationErrors, "tag") ? validationErrors["tag"][0] : null}
              />
            )}
            <Select
              className="c-org-form__select"
              label="Status"
              data={STATUS_COMPUTE}
              onChange={(val) => onChangeField("status", val.value)}
              defaultValue={currentStatus}
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

const AddCataCompForm = memo(MemoizedAddCataCompForm);

export default AddCataCompForm;
