import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import "./Index.scss";

type TWebhookHeaderProps = {
  onClose: () => void;
  type?: "add" | "update";
};

const WebhookHeader = (props: TWebhookHeaderProps) => {
  const { type = "add", onClose } = props;
  return (
    <div className="c-webhook-form__header">
      <ul className="c-webhook-form__breadcrumbs">
        <Breadcrumbs
          data={[
            { label: "Webhooks", onClick: onClose },
            { label: `${type === "add" ? "Add webhook" : "Update webhook"}` },
          ]}
        />
      </ul>
    </div>
  );
};

export default WebhookHeader;
