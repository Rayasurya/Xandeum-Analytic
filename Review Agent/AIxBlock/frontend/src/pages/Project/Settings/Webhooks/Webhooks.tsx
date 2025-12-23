import React, { Suspense, useCallback, useState } from "react";
import { IconInfo, IconPlus } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import InputBase from "@/components/InputBase/InputBase";
import Notice from "@/components/Notice/Notice";
import Spin from "@/components/Spin/Spin";
import { useGetWebhooks } from "@/hooks/settings/webhooks/useGetWebhooks";
import { TProjectModel } from "@/models/project";
import { useApi } from "@/providers/ApiProvider";
import LayoutSettings from "../LayoutSettings/Index";
import WebhookAction from "./WebhookForm/FormAction/Index";
import WebhookHeader from "./WebhookForm/FormHeader/Index";
import WebhookItem, { TWebhookResponse } from "./WebhookItem/WebhookItem";
import "./Webhooks.scss";
import { createAlert, createAlertSuccess } from "@/utils/createAlert";
import { useNavigate } from "react-router-dom";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

type TMLProps = {
  data?: TProjectModel | null;
};

const Webhooks = (props: TMLProps) => {
  const api = useApi();
  const [isShowWebhookForm, setShowWebhookForm] = useState<boolean>(false);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { error, listData, fetchData: refetch } = useGetWebhooks();
  const [urlInput, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<{[k:string]: string[]}>({});
  const navigate = useNavigate();

  const deleteWebhook = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this webhook?",
        onSubmit() {
          try {
            const ar = api.call("delWebhooks", {
              params: { id: id.toString() },
            });

            ar.promise.then(() => {
              refetch().catch();
            });
          } catch (error) {
            const err = error instanceof Error ? error.message : "Something when wrong!";
            infoDialog({ message: err });
          }
        },
      });
    },
    [api, refetch]
  );

  async function onSubmitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setShowWebhookForm(false);
    setSaveError("");
    setSaveSuccess("");

    const endPoint = updateId ? "updateWebhooks" : "createWebhooks";
    const ar = api.call(endPoint, {
      params: updateId ? { id: updateId?.toString() ?? "" } : {},
      body: {
        url: urlInput,
        project: props.data?.id,
      },
    });

    ar.promise
      .then(async (res) => {
        if (res.ok) {
          refetch().catch();
          setSaveSuccess("New webhook has been created successfully.")
          closeForm();
          return;
        }

        const data = await res.json();

        if (Object.hasOwn(data, "validation_errors")) {
          setValidationErrors(data.validation_errors);
        }

        if (Object.hasOwn(data, "detail")) {
          setSaveError(data.detail);
        } else {
          setSaveError(res.statusText);
        }

        setShowWebhookForm(true);
      })
      .catch(e => {
        let msg = "An error occurred while saving webhook.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setSaveError(msg);
        setShowWebhookForm(true);

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const showForm = (val?: TWebhookResponse) => {
    if (val) {
      setUpdateId(val.id);
      setUrl(val.url);
    } else {
      setUpdateId(null);
      setUrl("");
    }

    setSaveSuccess("");
    setShowWebhookForm(true);
  };

  const closeForm = () => {
    setUpdateId(null);
    setUrl("");
    setShowWebhookForm(false);
    setSaveError("");
    setValidationErrors({});
  };

  const saveErrorNode = React.useMemo(() => {
    return createAlert(saveError, undefined, true);
  }, [saveError]);

  const saveSuccessNode = React.useMemo(() => {
    return createAlertSuccess(saveSuccess);
  }, [saveSuccess]);

  const toggleActive = React.useCallback((id: number, active: boolean) => {
    const ar = api.call("updateWebhooks", {
      params: { id: id.toString() },
      body: {
        is_active: active,
      },
    });

    ar.promise
      .then(r => {
        if (!r.ok) {
          return;
        }

        refetch();
      })
  }, [api, refetch]);

  if (error) {
    return <div className="c-webhooks m-229 loading-error">
      <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refetch(),
        }
      ]} />
    </div>
  }

  return (
    <div className="c-content-settings">
      <div className="c-webhooks m-303">
        {isLoading && <Spin loading={isLoading} />}
        {error && <Notice icon={<IconInfo />} title={error} status="error" />}
        <div className="c-webhooks__heading">
          <div className="c-webhooks__heading-left">
            <h2>Webhooks</h2>
            <p>
              Webhooks allow external services to be notified when certain
              events happen. When the specified events occur, a POST request is
              sent to each of the URLs you provide.
            </p>
          </div>
          <div className="c-webhooks__heading-right">
            <Button
              icon={<IconPlus width={14} height={14} />}
              size="small"
              className="c-webhooks--add"
              onClick={() => showForm()}
              disabled={updateId !== null || isShowWebhookForm}
            >
              Add
            </Button>
          </div>
        </div>
        {saveSuccessNode}
        {saveErrorNode}
        <div className="c-webhooks__section">
          <Suspense>
            {isShowWebhookForm && (
              <form onSubmit={(e) => onSubmitForm(e)}>
                <WebhookHeader
                  onClose={closeForm}
                  type={updateId ? "update" : "add"}
                />
                <InputBase
                  label="URL"
                  placeholder="URL"
                  onChange={(e) => {
                    setUrl(e.target.value);
                  }}
                  value={urlInput}
                  error={Object.hasOwn(validationErrors, "url") ? validationErrors["url"][0] : null}
                />
                <WebhookAction
                  onClose={closeForm}
                  type={updateId ? "update" : "add"}
                />
              </form>
            )}
          </Suspense>
        </div>
        <div className="c-webhooks__section">
          {listData?.map((w) => (
            <WebhookItem
              key={`key-wh-${w.id}`}
              item={w}
              onDelete={deleteWebhook}
              onEdit={(e) => showForm(e)}
              onToggle={() => toggleActive(w.id, !w.is_active)}
            />
          ))}
        </div>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/settings/ml`}
        nextUrl={"/projects/" + props.data?.id + `/settings/labels`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/settings/labels`)}
      />
    </div>
  );
};

export default Webhooks;
