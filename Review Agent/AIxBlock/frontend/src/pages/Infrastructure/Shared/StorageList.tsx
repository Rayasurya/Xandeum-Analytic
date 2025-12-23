import EmptyContent from "@/components/EmptyContent/EmptyContent";
import React, {useCallback, useState} from "react";
import {useInfrastructureProvider} from "../InfrastructureProvider";
import StorageItem from "./StorageItem";
import styles from "./StorageList.module.scss";
import Modal from "@/components/Modal/Modal";
import IconPlus from "@/assets/icons/IconPlus";
import StorageForm from "./StorageForm";
import {confirmDialog, infoDialog} from "@/components/Dialog";
import {useApi} from "@/providers/ApiProvider";

export type TProps = {
  setTriggerAdd?: (f: Function) => void;
}

export default function StorageList({setTriggerAdd}: TProps) {
  const {globalStorages} = useInfrastructureProvider();
  const [showModal, setShowModal] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const api = useApi();

  const closeModal = React.useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
  }, []);

  const openModal = React.useCallback((item?: any) => {
    setSelectedItem(item);
    setShowModal(true);
  }, []);

  const deleteStorage = useCallback((type: string, id: number) => {
    confirmDialog({
      title: "Delete storage",
      message: "Are you sure you want to delete this storage?",
      onSubmit: () => {
        const ar = api.call("deleteGlobalStorage", {
          params: {type:type, pk: id.toString()},
        });

        ar.promise
          .then(async res => {
            if (res.ok) {
              globalStorages.refresh();
              return;
            }

            const data = await res.clone().json();

            if (Object.hasOwn(data, "message")) {
              throw new Error(data.message);
            } else if (Object.hasOwn(data, "detail")) {
              throw new Error(data.detail);
            } else {
              throw new Error(res.statusText);
            }
          })
          .catch(e => {
            let msg = "An error occurred while deleting storage. Please try again!";

            if (e instanceof Error) {
              msg = e.message;
            }

            infoDialog({title: "Error", message: msg});
          })
          .finally(() => {
            if (ar.controller.signal.aborted) {
              return;
            }
          });
      },
    });
  }, [api, globalStorages]);

  React.useEffect(() => {
    setTriggerAdd?.(openModal);
  }, [openModal, setTriggerAdd]);

  return (
    <>
      {!globalStorages.list || globalStorages.list.length === 0 ? (
        <EmptyContent message="(Empty list)"/>
      ) : (
        <div className={styles.container}>
          {
            globalStorages.list.map(s => (
              <StorageItem
                key={"storage-" + s.id}
                data={s}
                onEdit={() => openModal(s)}
                onDelete={id => deleteStorage(s.storage_type, id)}
              />
            ))
          }
        </div>
      )}
      <Modal
        open={showModal}
        title={selectedItem ? "Edit Storage" : "Create Storage"}
        icon={<IconPlus/>}
        onCancel={closeModal}
        modalLoading={isLoadingForm}
      >
      <StorageForm
          closeModal={closeModal}
          refetchStorages={globalStorages.refresh}
          selectedItem={selectedItem}
          setIsLoadingForm={setIsLoadingForm}/>
      </Modal>
    </>
  );
}
