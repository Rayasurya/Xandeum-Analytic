import React, {memo, useCallback, useState} from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import { useApi } from "@/providers/ApiProvider";
import {useAuth} from "@/providers/AuthProvider";
import Alert from "@/components/Alert/Alert";

type TAddOrgFormProps = {
  data?: any | null;
  type: "UPDATE" | "ADD";
  active_org?: number;
  refetch: () => Promise<void>;
  onClose: () => void;
};

const MemoizedAddTempForm = (props: TAddOrgFormProps) => {
  const { data, type, refetch, onClose } = props;
  const api = useApi();
  const {addPromise} = usePromiseLoader();
  const [validationErrors, setValidationErrors] = useState<{[k:string]: string[]}>({});
  const [error, setError] = useState("");
  const {user} = useAuth();

  const [formData, setFormData] = useState<{[k:string]: any}>(
    type === "ADD"
      ? {
        id:"",
        name: "",
        group: "",
        ml_image: "",
        ml_ip: "",
        ml_port: "",
        extensions: "",
      }
      : data
  );

  const onChangeField = (field: string, val: string) => {
    setFormData(ps => ({...ps, [field]: val}));
  };

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const ar = api.call(type === "UPDATE" ? "updateAnnoTemp" : "createAnnoTemp", {
      params: type === "UPDATE" ? { id: data.id.toString() } : {},
      body: {
        ...formData,
        author_id: user?.id ?? 0,
        order: 0,
      },
    });

    addPromise(ar.promise, "Saving template...");

    ar.promise
      .then(async r => {
        if (r.ok) {
          refetch().catch(() => void 0);
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
  }, [api, type, data?.id, formData, user?.id, addPromise, refetch, onClose]);

  const errorNode = React.useMemo(() => {
    if (!error) {
      return null;
    }

    return (
      <Alert
        message={error}
        type="Danger"
        style={{ marginBottom: 16 }}
        actions={[{ label: "Dismiss", onClick: () => setError("") }]}
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
              label="Name"
              placeholder="Name"
              value={formData.name ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("name", e.target.value)}
              error={Object.hasOwn(validationErrors, "name") ? validationErrors["name"][0] : null}
              isRequired
            />
            <InputBase
              className="c-org-form__input"
              label="Group"
              placeholder="Group"
              value={formData.group ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("group", e.target.value)}
              error={Object.hasOwn(validationErrors, "group") ? validationErrors["group"][0] : null}
              isRequired
            />
            <InputBase
              className="c-org-form__input"
              label="ML IMAGE"
              placeholder="ML Docker Image"
              value={formData.ml_image ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("ml_image", e.target.value)}
              error={Object.hasOwn(validationErrors, "ml_image") ? validationErrors["ml_image"][0] : null}
            />
            <InputBase
              className="c-org-form__input"
              label="ML IP"
              placeholder="ML IP"
              value={formData.ml_ip ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("ml_ip", e.target.value)}
              error={Object.hasOwn(validationErrors, "ml_ip") ? validationErrors["ml_ip"][0] : null}
            />
            <InputBase
              className="c-org-form__input"
              label="ML Port"
              placeholder="ML Port"
              value={formData.ml_port ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("ml_port", e.target.value)}
              error={Object.hasOwn(validationErrors, "ml_port") ? validationErrors["ml_port"][0] : null}
            />
            <InputBase
              className="c-org-form__input"
              label="Supported file extensions"
              placeholder="Comma separated list: .jpg,.wav,.mp3"
              value={formData.extensions ?? ""}
              allowClear={false}
              onChange={(e) => onChangeField("extensions", e.target.value)}
              error={Object.hasOwn(validationErrors, "extensions") ? validationErrors["extensions"][0] : null}
            />
            <InputBase
              className="c-org-form__input"
              label="Config"
              placeholder="Config"
              value={formData.config ?? ""}
              allowClear={false}
              isMultipleLine={true}
              onChange={(e) => onChangeField("config", e.target.value)}
              error={Object.hasOwn(validationErrors, "config") ? validationErrors["config"][0] : null}
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

const AddTempForm = memo(MemoizedAddTempForm);

export default AddTempForm;
