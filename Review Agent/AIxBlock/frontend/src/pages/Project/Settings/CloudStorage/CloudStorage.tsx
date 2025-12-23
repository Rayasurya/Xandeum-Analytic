import {Suspense, lazy, useCallback, useMemo, useState, useEffect} from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import { useAllListDataStorage } from "@/hooks/settings/cloudStorage/useGetListStorage";
import { useApi } from "@/providers/ApiProvider";
import { useProjectContext } from "@/providers/ProjectProvider";
import Card from "./Card/Card";
import "./CloudStorage.scss";
import StorageForm from "./StorageForm/StorageForm";
import { TProjectModel } from "@/models/project";
import LayoutSettings from "../LayoutSettings/Index";
import IconCirclePlus from "@/assets/icons/IconCirclePlus";
import { useNavigate } from "react-router-dom";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {confirmDialog, infoDialog} from "@/components/Dialog";
import AppLoading from "@/components/AppLoading/AppLoading";
import { DATATYPE } from "../Index";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

const Spin = lazy(() => import("@/components/Spin/Spin"));

type TCloudStorageProps = {
  data?: TProjectModel | null;
  importDataType: DATATYPE;
};

const CloudStorage = (props: TCloudStorageProps) => {
  const { data } = props;
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "source" or "target"
  const [loading, setLoading] = useState(false);
  const { list, exportList, error, refresh } = useAllListDataStorage(data?.id);
  const [listDataStorage, setListDataStorage] = useState({
    list: list ?? [],
    exportList: exportList ?? [],
  });
  const api = useApi();
  const navigate = useNavigate();
  const { state } = useProjectContext();
  const { dataProject } = state;
  const { id } = dataProject;
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const endPoint = props.importDataType === "RAWDATA" ? "internet" : "dataset_hubs";

  useBooleanLoader(loading, "Loading storage list...");
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const openModal = (type: string, isEdit: boolean = false) => {
    setShowModal(true);
    setModalType(type);
  };

  const refetchStorages = useCallback((target: string) => {
    setLoading(true);
    const result = api.call(
      `${target === "export" ? "listExportStorage" : "listStorage"}`,
      {
        params: { project: data ? data?.id.toString() : id.toString() },
      }
    );

    result.promise.then(async (res) => {
      const data = await res.json();
      data &&
        setListDataStorage((prevData) => {
          return target === "export"
            ? {
                ...prevData,
                exportList: data,
              }
            : {
                ...prevData,
                list: data,
              };
        });
    });

    setLoading(false);
  }, [api, id, data]);

  const deleteStorage = useCallback((target: string, type: string, id: number) => {
    confirmDialog({
      title: "Delete storage",
      message: "Are you sure you want to delete this storage?",
      onSubmit: () => {
        setLoading(true);
        const ar = api.call(target === "target" ? "deleteExportStorage" : "deleteStorage", {
          params: {type, pk: id.toString()},
          body: {"project": data ? data?.id.toString() : id.toString()}
        });

        ar.promise
          .then(async res => {
            if (res.ok) {
              refetchStorages(target === "target" ? "export" : "import");
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

            infoDialog({title: "Error", message: msg});
          })
          .finally(() => {
            if (ar.controller.signal.aborted) {
              return;
            }

            setLoading(false);
          });
      },
    });
  }, [api, data, refetchStorages]);

  const handleEdit = useCallback((target: string, type: string, id: number, itemData: any) => {
    confirmDialog({
      title: "Edit storage",
      message: "Are you sure you want to edit this storage?",
      onSubmit: () => {
        openModal(target, true);
        setSelectedItem(itemData);
      }
    })
  } , []);

  const storageLists = useMemo(() => {
    return (
      <div className="c-cloud__data-list">
        {listDataStorage.list.map((item: any, index: number) => (
          <Card
            key={`card-${item.id}-${index}`}
            data={item}
            type="source"
            onDelete={deleteStorage}
            onEdit={() => handleEdit("source_edit", item.type, item.id, item)}
            index={index}
            onSyncSuccess={() => refetchStorages("import")}
          />
        ))}
        {listDataStorage.exportList.map((item: any, index: number) => (
          <Card
            key={`card-${item.id}-${index}`}
            data={item}
            type="target"
            onDelete={deleteStorage}
            onEdit={() => handleEdit("target_edit", item.type, item.id, item)}
            index={index}
            onSyncSuccess={() => refetchStorages("export")}
          />
        ))}
      </div>
    );
  }, [deleteStorage, handleEdit, listDataStorage.exportList, listDataStorage.list, refetchStorages]);

  useEffect(() => {
    if (list && exportList) {
      setListDataStorage({
        list: list ?? [],
        exportList: exportList ?? [],
      });
    }
  }, [list, exportList]);

  if (error) {
    return <div className="c-cloud m-307 loading-error">
      <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refresh(),
        }
      ]} />
    </div>
  }

  return (
    <div className="m-335">
      <div className="c-cloud m-308">
        <Suspense>
          <Spin loading={loading} />
        </Suspense>
        <div className="c-cloud__heading">
          <h4>
            Use cloud or database storage as the source for your labeling tasks
            or the target of your completed dataset.
          </h4>
          <div className="c-cloud__action">
            <Button
              type="secondary"
              size="medium"
              icon={<IconCirclePlus />}
              className="c-cloud__action--add source"
              onClick={() => openModal("source")}
            >
              Source Cloud Storage
            </Button>
            <Button
              size="medium"
              icon={<IconCirclePlus />}
              className="c-cloud__action--add target"
              onClick={() => openModal("target")}
            >
              Target Cloud Storage
            </Button>
          </div>
        </div>
        {storageLists}
        <Suspense fallback={<AppLoading/>}>
          <Modal
            open={showModal}
            title={
              modalType === "source"
                ? "Add Source Storage"
                : modalType === "source_edit"
                ? "Edit Source Storage"
                : modalType === "target_edit"
                ? "Edit Target Storage"
                : "Add Target Storage"
            }
            icon={<IconPlus />}
            className="c-ml__add-gallery"
            onCancel={closeModal}
            modalLoading={isLoadingForm}
          >
            <StorageForm
              formId={data?.id ?? 1}
              target={modalType === "target" ? "export" 
              : modalType === "target_edit" ? "target_edit"
              : modalType === "source_edit" ? "source_edit"
              : undefined}
              closeModal={closeModal}
              refetchStorages={refetchStorages}
              selectedItem={selectedItem}
              setIsLoadingForm={setIsLoadingForm}
            />
          </Modal>
        </Suspense>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/import/local`}
        nextUrl={"/projects/" + props.data?.id + `/import/${endPoint}`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/import/${endPoint}`)}
      />
    </div>
  );
};

export default CloudStorage;
