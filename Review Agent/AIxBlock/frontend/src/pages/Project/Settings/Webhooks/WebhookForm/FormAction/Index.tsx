import Button from "@/components/Button/Button";
import "./Index.scss";

type TWebhookActionProps = {
  onClose: () => void;
  type?: "add" | "update";
};

const WebhookAction = (props: TWebhookActionProps) => {
  const { onClose, type = "add" } = props;
  return (
    <div className="c-webhook-form__action">
      <Button
        htmlType="button"
        onClick={onClose}
        className="c-webhooks--cancel"
      >
        Cancel
      </Button>
      <Button htmlType="submit" className="c-webhooks--add">
        {type === "add" ? "Add" : "Update"}
      </Button>
    </div>
  );
};

export default WebhookAction;
