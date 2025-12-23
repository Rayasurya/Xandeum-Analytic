import React, { useState } from "react";
import { IconDelete, IconEditCricle } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { infoDialog } from "@/components/Dialog";
import { useApi } from "@/providers/ApiProvider";
import { formatDateTime } from "@/utils/formatDate";
import styles from "./StorageItem.module.scss";

type TStorageItemProps = {
  data: any;
  type: "source" | "target";
  onDelete: (target: string, type: string, id: number) => void;
  onEdit: (target: string, type: string, id: number) => void;
  index: number;
  onSyncSuccess: () => void;
  canSync?: boolean;
};

const StorageItem = ({ data, type, onDelete, onEdit, index, onSyncSuccess, canSync }: TStorageItemProps) => {
  const api = useApi();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const syncStorage = async (params: any) => {
    try {
      setIsSyncing(true);
      let result = false;
      const formData = new FormData();
      formData.append("type_import", "raw_data");

      const ar = await api.call(
        params.target === "source" ? "importStorage" : "exportStorage",
        {
          params: {
            type: params.type,
            pk: params.id,
          },
          body: formData,
        }
      );

      ar.promise.then(async res => {
        if (res.ok) {
          // TODO: Handle the data
          setTimeout(() => {
            infoDialog({ message: "Sync storage successful!" });
          }, 0);

          result = true;
        } else {
          const error = await res.json();

          if (window.APP_SETTINGS.debug) {
            console.error("Failed to sync storage. Please try again status:", res.status);
            console.log(error);
          }

          setTimeout(() => {
            infoDialog({ message: "Failed to sync storage. Please try again." });
          }, 0);
        }
        return result;
      })
        .finally(() => {
          if (ar.controller.signal.aborted) {
            return;
          }

          setIsSyncing(false);
        });
    } catch (error) {
      const err =
        error instanceof Error ? error.message : "Something when wrong!";
      infoDialog({ message: err });
    }
  };

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
    <div className={styles.storageItem}>
      <div className={styles.header}>
        <Button className={`${styles.headerType} ${type}`}>
          {/* <strong>{type.toUpperCase()}</strong> {String(data.type).toUpperCase()}-{data.id} */}
          #{data.id}
        </Button>
        <div className={styles.headerAction}>
          {index !== 0 &&
            <button className={styles.deleteBtn} onClick={() => onDelete(type, data.type, data.id)} style={{cursor: "pointer"}}>
              <IconDelete width={24} height={24} />
            </button>
          }
          <button className={styles.editBtn} onClick={() => handleEdit()} style={{cursor: "pointer"}}>
            <IconEditCricle />
          </button>
        </div>
      </div>
      <div className={styles.summary}>
        <dl className={styles.dl}>
          {
            ["title", "storage_type", "region_name", "last_sync", "created_at"].map(k => {
              if (!(k in data)) {
                return null;
              }

              return (
                <>
                  <dt className={styles.dt}>
                    {k.split("_").join(" ").toUpperCaseFirst()}
                  </dt>
                  <dd className={styles.dd}>
                    {
                      !data[k]
                        ? "-"
                        : k === "last_sync" || k === "created_at" ? formatDateTime(data[k] as string) : data[k]
                    }
                  </dd>
                </>
              )
                ;
            })
          }
        </dl>
      </div>
      {canSync && (
        <Button
          type="secondary"
          onClick={() => handleSyncStore()}
          className={isSyncing ? styles.syncing : styles.syncButton}
        >
          Sync Storage
        </Button>
      )}
    </div>
  );
};

export default StorageItem;
