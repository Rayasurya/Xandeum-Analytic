import React/*, {useCallback, useState}*/ from "react";
import {IconDelete, IconEditCricle} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
// import {infoDialog} from "@/components/Dialog";
// import {useApi} from "@/providers/ApiProvider";
import {formatDateTime} from "@/utils/formatDate";
import styles from "./StorageItem.module.scss";

type TStorageItemProps = {
  data: any;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onSyncSuccess?: () => void;
};

const StorageItem = ({data, onDelete, onEdit/*, onSyncSuccess*/}: TStorageItemProps) => {
  // const api = useApi();
  // const [isSyncing, setIsSyncing] = useState<boolean>(false);
  //
  // const syncStorage = useCallback(() => {
  //   setIsSyncing(true);
  //   let result = false;
  //   // const formData = new FormData();
  //   // formData.append("type_import", "raw_data");
  //
  //   const ar = api.call(
  //     "globalStorage",
  //     {
  //       params: {
  //         type: data.type,
  //         pk: data.id,
  //       },
  //       // body: formData,
  //     }
  //   );
  //
  //   ar.promise
  //     .then(async res => {
  //       if (res.ok) {
  //         infoDialog({message: "Sync storage successful!"});
  //         result = true;
  //         onSyncSuccess?.()
  //       } else {
  //         const error = await res.json();
  //
  //         if (window.APP_SETTINGS.debug) {
  //           console.error("Failed to sync storage. Please try again status:", res.status);
  //           console.log(error);
  //         }
  //
  //         infoDialog({message: "Failed to sync storage. Please try again."});
  //       }
  //
  //       return result;
  //     })
  //     .catch(error => {
  //       const err = error instanceof Error ? error.message : "Something when wrong!";
  //       infoDialog({message: err});
  //     })
  //     .finally(() => {
  //       if (ar.controller.signal.aborted) {
  //         return;
  //       }
  //
  //       setIsSyncing(false);
  //     });
  // }, [api, data.id, data.type, onSyncSuccess]);

  return (
    <div className={styles.storageItem}>
      <div className={styles.header}>
        <Button className={`${styles.headerType}`}>
          #{data.id}
        </Button>
        <div className={styles.headerAction}>
          {onDelete &&
            <button className={styles.deleteBtn} onClick={() => onDelete(data.id)} style={{cursor: "pointer"}}>
              <IconDelete width={24} height={24}/>
            </button>
          }
          {onEdit &&
            <button className={styles.editBtn} onClick={() => onEdit(data.id)} style={{cursor: "pointer"}}>
              <IconEditCricle/>
            </button>
          }
        </div>
      </div>
      <div className={styles.summary}>
        <dl className={styles.dl}>
          {
            ["title", "storage_type", "region_name", "created_at"].map(k => {
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
      {/*<Button
        type="secondary"
        onClick={() => syncStorage()}
        className={isSyncing ? styles.syncing : styles.syncButton}
      >
        Sync Storage
      </Button>*/}
    </div>
  );
};

export default StorageItem;
