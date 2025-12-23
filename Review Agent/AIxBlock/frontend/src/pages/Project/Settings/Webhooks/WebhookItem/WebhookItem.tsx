import IconDelete from "@/assets/icons/IconDelete";
import IconEdit from "@/assets/icons/IconEdit";
import Switch from "@/components/Switch/Switch";
import { formatDateTime } from "@/utils/formatDate";
import "./WebhookItem.scss";

export type TWebhookResponse = {
  actions?: any[];
  created_at: string;
  headers?: {};
  id: number;
  is_active: boolean;
  organization?: number;
  project?: number;
  send_for_all_actions?: boolean;
  send_payload?: true;
  updated_at?: string;
  url: string;
};

interface TWebhookProps {
  item: TWebhookResponse;
  onDelete: (id: number) => void;
  onEdit: (val: TWebhookResponse) => void;
  onToggle: () => void;
}

const WebhookItem = (props: TWebhookProps) => {
  const { item, onDelete, onEdit } = props;

  return (
    <div className="c-webhooks__modify">
      <div className="c-webhooks__switch">
        <Switch checked={item.is_active} onChange={() => props.onToggle()} />
        <div>
          {item.url && (
            <span className="c-webhooks__switch-label">{item.url}</span>
          )}
          {item.created_at && (
            <span className="c-webhooks__switch-subLabel">
              {formatDateTime(item.created_at)}
            </span>
          )}
        </div>
      </div>
      <div className="c-webhooks__action">
        <button
          className="c-webhooks__action--edit"
          onClick={() => onEdit(item)}
        >
          <IconEdit />
        </button>
        <button
          className="c-webhooks__action--delete"
          onClick={() => onDelete(item.id)}
        >
          <IconDelete />
        </button>
      </div>
    </div>
  );
};

export default WebhookItem;
