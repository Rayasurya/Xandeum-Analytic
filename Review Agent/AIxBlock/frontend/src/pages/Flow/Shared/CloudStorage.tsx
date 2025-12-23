import { useCallback, useMemo, useState } from 'react';
import { IconCirclePlus, IconPlus } from '../../../assets/icons/Index';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import { TProjectModel } from '../../../models/project';
import styles from './CloudStorage.module.scss';
import StorageForm from './Storage/Form';
import { confirmDialog, infoDialog } from '../../../components/Dialog';
import { useApi } from '../../../providers/ApiProvider';
import StorageItem from './Storage/StorageItem';
import EmptyContent from '../../../components/EmptyContent/EmptyContent';
import {TPageFlowProvider, useFlowProvider} from "../FlowProvider";
import GlobalStorageList from "./Storage/GlobalStorageList";
import {toastError} from "@/utils/toast";
import {extractErrorMessage, extractErrorMessageFromResponse, unexpectedErrorMessage} from "@/utils/error";
import {useLoader} from "@/providers/LoaderProvider";

export type TProps = {
  canAdd?: boolean;
  canSync?: boolean;
  project: TProjectModel | null;
  defaultColumnsCout?: "column2" | "column3" | "column4";
  placementAction?: "flex-start" | "center" | "flex-end";
  refreshProject?: TPageFlowProvider["refreshProject"];
}

export default function CloudStorage({ canAdd, canSync, project, defaultColumnsCout = "column3", placementAction = "center", refreshProject }: TProps) {
  const api = useApi();
  const {storages} = useFlowProvider();
  const {error, refresh} = storages;
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [linkGlobalStorage, setLinkGlobalStorage] = useState(false);
  const {waitingForPromise} = useLoader();

  const column = useMemo(() => {
    const count = (storages.list?.length ?? 0) + (storages.exportList?.length ?? 0);

    if (count === 1) {
      return styles.column1;
    } else if (count === 2) {
      return styles.column2;
    }

    switch (defaultColumnsCout) {
      case "column2":
        return styles.column2;
      case "column4":
        return styles.column4;
      default:
        return styles.column3;
    }
  }, [defaultColumnsCout, storages.exportList?.length, storages.list?.length]);

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const openModal = (type: string, isEdit: boolean = false) => {
    setShowModal(true);
    setModalType(type);
  };

  const deleteStorage = useCallback((target: string, type: string, id: number) => {
    confirmDialog({
      title: "Delete storage",
      message: "Are you sure you want to delete this storage?",
      onSubmit: () => {
        const ar = api.call(target === "target" ? "deleteExportStorage" : "deleteStorage", {
          params: { type, pk: id.toString() },
          body: {"project": project?.id}
        });

        ar.promise
          .then(async res => {
            if (res.ok) {
              storages.refresh();
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
            let msg = "An error ocurred while deleting storage. Please try again!";

            if (e instanceof Error) {
              msg = e.message;
            }

            infoDialog({ title: "Error", message: msg });
          })
          .finally(() => {
            if (ar.controller.signal.aborted) {
              return;
            }
          });
      },
    });
  }, [api, project?.id, storages]);

  const handleEdit = useCallback((target: string, type: string, id: number, itemData: any) => {
    infoDialog({
      title: "Edit Storage",
      message: "We recommend creating a new project since you're changing the entire storage setup. Currently, we don't support moving data to new storage.",
    });

    // confirmDialog({
    //   title: "Edit storage",
    //   message: "Are you sure you want to edit this storage?",
    //   onSubmit: () => {
    //     openModal(target, true);
    //     setSelectedItem(itemData);
    //   }
    // })
  }, []);

  const onSyncSuccess = useCallback(() => {
    storages.refresh();
    refreshProject?.(false);
  }, [refreshProject, storages]);

  const storageLists = useMemo(() => {
    if (storages.list?.length === 0 && storages.exportList?.length === 0) {
      return (
        <EmptyContent message="No cloud storage found." />
      );
    }

    return (
      <div className={`${styles.cloudList} ${column}`}>
        {storages.list?.map((item: any, index: number) => (
          <StorageItem
            key={`card-${item.id}-${index}`}
            data={item}
            type="source"
            onDelete={deleteStorage}
            onEdit={() => handleEdit("source_edit", item.type, item.id, item)}
            index={index}
            onSyncSuccess={onSyncSuccess}
            canSync={canSync}
          />
        ))}
        {storages.exportList?.map((item: any, index: number) => (
          <StorageItem
            key={`card-${item.id}-${index}`}
            data={item}
            type="target"
            onDelete={deleteStorage}
            onEdit={() => handleEdit("target_edit", item.type, item.id, item)}
            index={index}
            onSyncSuccess={onSyncSuccess}
            canSync={canSync}
          />
        ))}
      </div>
    );
  }, [storages.list, storages.exportList, column, deleteStorage, handleEdit, onSyncSuccess, canSync]);

  const onLinkStorage = useCallback((id: number, type: string) => {
    setLinkGlobalStorage(false);

    const ar = api.call("linkGlobalStorage", {
      params: {
        project: project?.id.toString() ?? "0",
        pk: id.toString(),
        type: type,
      }
    });

    ar.promise
      .then(async r => {
        if (r.ok) {
          storages.refresh();
          return;
        }

        toastError(await extractErrorMessageFromResponse(r));
        setLinkGlobalStorage(true);
      })
      .catch(e => {
        toastError(extractErrorMessage(e) ?? unexpectedErrorMessage(e));
        setLinkGlobalStorage(true);

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      });

    waitingForPromise(ar.promise, "Linking storage with the project...");
  }, [api, project?.id, storages, waitingForPromise]);

  if (error) {
    return (
      <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refresh(),
        }
      ]} />
    )
  }

  return (
    <div className={styles.cloud}>
      {canAdd && (
        <div className={styles.action} style={{justifyContent: placementAction}}>
          <Button
            type="secondary"
            size="small"
            icon={<IconCirclePlus/>}
            className={styles.source}
            onClick={() => openModal("source")}
          >
            {/* Source Cloud Storage */}
            Add New Storages
          </Button>
          <Button
            size="small"
            icon={<IconCirclePlus/>}
            className={styles.target}
            onClick={() => setLinkGlobalStorage(true)}
          >
            Link Existing Storages
          </Button>
        </div>
      )}
      {storageLists}
      <Modal
        open={showModal}
        title={
          modalType === "source"
            ? "Add Storage"
            : modalType === "source_edit"
              ? "Edit Storage"
              : modalType === "target_edit"
                ? "Edit Target Storage"
                : "Add Target Storage"
        }
        icon={<IconPlus />}
        onCancel={closeModal}
        modalLoading={isLoadingForm}
      >
        <StorageForm
          formId={project?.id ?? 1}
          target={modalType === "target" ? "export"
            : modalType === "target_edit" ? "target_edit"
              : modalType === "source_edit" ? "source_edit"
                : undefined}
          closeModal={closeModal}
          refetchStorages={storages.refresh}
          selectedItem={selectedItem}
          setIsLoadingForm={setIsLoadingForm}
        />
      </Modal>
      <Modal
        open={linkGlobalStorage}
        title="Global Storage"
        onClose={() => setLinkGlobalStorage(false)}
      >
        <GlobalStorageList onLink={onLinkStorage} />
      </Modal>
    </div>
  );
}
