import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import { TCompute } from "@/hooks/admin/compute/useCompute";
import { useGetTemplates } from "@/hooks/admin/template/useGetListTemplates";
import { useUserLayout } from "@/layouts/UserLayout";
import { useApi } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { formatDateTime } from "@/utils/formatDate";
import AddTempForm from "./AddTempForm/Index";
import AdminLayout from "../Layout";
import Table, {TableActions} from "@/components/Table/Table";
import {TAnnotationTemplate} from "@/models/annotationTemplateList";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import AppLoading from "@/components/AppLoading/AppLoading";

const Template = () => {
  const userLayout = useUserLayout();
  const { call } = useApi();
  const { user } = useAuth();
  const { templates, fetchData, loading, page, setPage, error } = useGetTemplates();
  const [isOpenAddCatalogModal, setOpenAddCatalogModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"UPDATE" | "ADD">("ADD");
  const [dataTemp, setDataTemp] = useState<TCompute | null>(null);
  useBooleanLoader(loading, "Loading Catalog...");

  const onCancelModal = () => {
    setOpenAddCatalogModal(false);
  };

  const onOpenAddCatalogModal = (type: "ADD" | "UPDATE", catalog?: any) => {
    if (catalog) {
      setDataTemp(catalog);
    }

    setModalType(type);
    setOpenAddCatalogModal(true);
  };

  const onDeleteTemplate = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this template?",
        onSubmit() {
          try {
            const ar = call("deleteAnnoTemp", {
              params: { id: id.toString() },
            });

            ar.promise.then(() => {
              fetchData();
            });
          } catch (error) {
            const err = error instanceof Error ? error.message : "Something when wrong!";
            infoDialog({message: err});
          }
        },
      });
    },
    [call, fetchData]
  );

  useEffect(() => {
    userLayout.setBreadcrumbs([{label: "Admin"}, { label: "Templates" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const errorNode = useMemo(() => {
    if (error) {
      return <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => fetchData(),
        }
      ]} />;
    }
    if (!error && templates && templates.results && templates.results.length === 0) {
      return <EmptyContent message="No template found" />;
    }
    return null;
  }, [error, templates, fetchData]);

  return (
    <AdminLayout
      title="Templates"
      actions={<>
        <Button size="medium" icon={<IconPlus />} type="gradient" onClick={() => onOpenAddCatalogModal("ADD")}>
            Add
          </Button>
        </>
      }
    >
      {templates && templates.results && templates.results.length > 0 ? (
        <>
          <Table
            columns={[
              { label: "ID", dataKey: "id", align: "RIGHT" },
              {
                label: "Name",
                noWrap: true,
                renderer: (dataRow: TAnnotationTemplate) => {
                  return (
                    <>
                      <div>{dataRow.name}</div>
                      {dataRow.extensions && dataRow.extensions.length > 0 && (
                        <em><small>Supports: {dataRow.extensions.split(",").join(", ")}</small></em>
                      )}
                    </>
                  );
                },
              },
              { label: "Group", dataKey: "group", noWrap: true },
              { label: "ML Image", dataKey: "ml_image", noWrap: true },
              {
                label: "ML Default",
                renderer: (dataRow: TAnnotationTemplate) => {
                  if (dataRow.ml_ip && dataRow.ml_port) {
                    const ml_host = `${dataRow.ml_ip}:${dataRow.ml_port}`;
                    return (
                      <a
                        href={"http://" + ml_host}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {ml_host}
                      </a>
                    );
                  }

                  return null;
                },
              },
              {
                label: "Date Created",
                noWrap: true,
                renderer: (dataRow: TAnnotationTemplate) =>
                  formatDateTime(dataRow["created_at"]),
              },
              {
                align: "RIGHT",
                noWrap: true,
                renderer: (dataRow: TAnnotationTemplate) => (
                  <TableActions
                    actions={[
                      {
                        icon: "DELETE",
                        onClick: () => onDeleteTemplate(dataRow.id),
                      },
                      {
                        icon: "EDIT",
                        onClick: () => onOpenAddCatalogModal("UPDATE", dataRow),
                      },
                    ]}
                  />
                ),
              },
            ]}
            data={templates.results ?? []}
          />
          {templates.count > 1 &&
            <Pagination
              page={page}
              pageSize={10}
              total={templates.count ?? 0}
              setPage={setPage}
              target="admin/template"
            />
          }
        </>
      ) : (errorNode)}
      <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} template`}
          className="c-add-compute__modal"
          open={isOpenAddCatalogModal}
          onCancel={onCancelModal}
        >
          <AddTempForm
            data={dataTemp}
            type={modalType}
            active_org={user?.active_organization}
            refetch={fetchData}
            onClose={onCancelModal}
          />
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default Template;
