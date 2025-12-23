import { memo, useCallback, useMemo, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { useApi } from "@/providers/ApiProvider";
import { STATUS_COMPUTE } from "@/constants/projectConstants";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import Alert from "@/components/Alert/Alert";
import { TComputeMarketplace } from "@/models/computeMarketplace";
import { useAuth } from "@/providers/AuthProvider";

type TAddOrgFormProps = {
  data?: TComputeMarketplace;
  type: string;
  refetch: () => Promise<void>;
  onClose: () => void;
};

const MemoizedAddCompForm = (props: TAddOrgFormProps) => {
  const { data, type = "ADD", refetch, onClose } = props;
  const [dataComp, setDataComp] = useState({
    name: data?.name,
    status: data?.status ?? STATUS_COMPUTE[0].options[1].value, // default value is in_marketplace
  });
  const api = useApi();
  const { user } = useAuth();
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
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const tokenWorker = api.call("getTokenWorker").promise;
      const secretId = api.call("getSecretId").promise;

      const [apiTokenGet, apiClientGet] = await Promise.all([
        tokenWorker,
        secretId,
      ]);
      const resToken = await apiTokenGet?.json();
      const token = resToken?.token;
      const resClient = await apiClientGet?.json();
      const ipAddress = window.APP_SETTINGS.ip_compute;

      const dataSend = {
        ...dataComp,
        ip_address: ipAddress,
        infrastructure_id: token,
        client_id: resClient.client_id,
        client_secret: resClient.client_secret,
        owner_id: user?.id,
        author_id: user?.id,
        organization_id: user?.active_organization,
      };
      
      const ar = api.call(type === "UPDATE" ? "updateCompute" : "createCompute", {
        params: type === "UPDATE" ? { id: data!.id.toString() } : {},
        body: dataSend,
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
    [api, dataComp, user?.id, user?.active_organization, type, data, addPromise, refetch, onClose]
  );

  const errorNode = useMemo(() => {
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
              label="Compute name"
              placeholder="Type name project"
              value={dataComp?.name}
              allowClear={false}
              onChange={(e) => onChangeField("name", e.target.value)}
              error={Object.hasOwn(validationErrors, "name") ? validationErrors["name"][0] : null}
            />
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

const AddCompForm = memo(MemoizedAddCompForm);

export default AddCompForm;
