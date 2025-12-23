import React from "react";
import IconThreeDot from "@/assets/icons/IconThreeDot";
import Button from "@/components/Button/Button";
import { useProjectContext } from "@/providers/ProjectProvider";
import { formatDateTime } from "@/utils/formatDate";
import "./Card.scss";
import Dropdown from "@/components/Dropdown/Dropdown";
import DropdownItem from "@/components/DropdownItem/DropdownItem";

type TCardProps = {
  data: any;
  type: "source" | "target";
  onDelete: (target: string, type: string, id: number) => void;
  onEdit: (target: string, type: string, id: number) => void;
  index: any;
  onSyncSuccess: () => void;
};

const Card = ({ data, type, onDelete, onEdit, index, onSyncSuccess }: TCardProps) => {
  const { syncStorage, state } = useProjectContext();

  const handleSyncStore = () => {
    syncStorage({
      target: type,
      type: data.type,
      id: data.id,
    })
      .then(r => onSyncSuccess?.());
  };

  const handleEdit = () => {
    onEdit(type, data.type, data.id);
  };

  return (
    <div className="c-card">
      <div className="c-card__header">
        <Button className={`c-card__header-type ${type}`}>
          <strong>{type.toUpperCase()}</strong> {String(data.type).toUpperCase()}-{data.id}
        </Button>
        <Dropdown
          icon={<IconThreeDot />}
        >
          <DropdownItem data={[
            {label: "Edit", handler: handleEdit},
            ...(index === 0 ? [] : [{ label: "Delete", handler: () => onDelete(type, data.type, data.id) }])
            // {label: "Delete", handler: () => onDelete(type, data.type, data.id)},
          ]} />
        </Dropdown>
      </div>
      <div className="c-card__summary">
        {
          Object.entries(data)
            .filter(([key, _]) => ["last_sync", "created_at"].indexOf(key) > -1)
            .map(([key, value]) => {
              return (
                <>
                  <dl className="c-dl" key={`key-${key}`}>
                    <dt className="c-dl__dt">
                      {key.split("_").join(" ").toLowerCase()}
                    </dt>
                    <dd className="c-dl__dd">
                      {value === null ? (
                        "-"
                      ) : (
                        <>
                          {key === "last_sync" || key === "created_at"
                            ? formatDateTime(value as string)
                            : (value as React.ReactNode)}
                        </>
                      )}
                    </dd>
                  </dl>
                </>
              );
            })
        }
      </div>
      <div className="c-card__action">
        <Button
          type="secondary"
          onClick={() => handleSyncStore()}
          className={`sync-button ${
            state && state.storageId === data.id ? "syncing" : ""
          }`}
        >
          {state && state.storageId === data.id ? "Syncing..." : "Sync Storage"}
        </Button>
      </div>
    </div>
  );
};

export default Card;
