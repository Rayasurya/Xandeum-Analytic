import {Fragment, Suspense, useCallback, useEffect, useMemo, useState} from "react";
import { useSearchParams } from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlus from "@/assets/icons/IconPlus";
import Button, {TButtonProps} from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import { TCompute } from "@/hooks/admin/compute/useCompute";
import { useApi } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { formatDate } from "@/utils/formatDate";
import { useGetCataModel } from "@/hooks/admin/model/useGetCataModel";
import AddCataModeForm from "./AddCataModelForm/Index";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table, { TableActions } from "@/components/Table/Table";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import AppLoading from "@/components/AppLoading/AppLoading";

const Catalog = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { call } = useApi();
  const { user } = useAuth();
  const { catalog, page, pageSize, setPage, fetchData, loading, error } =
    useGetCataModel({
      page: currentPage ? Number(currentPage) : 1,
    });
  const [isOpenAddCatalogModal, setOpenAddCatalogModal] =
    useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  const [dataUserCompute, setDataUserCompute] = useState<TCompute>();

  useBooleanLoader(loading, "Loading Catalog...");

  const onCancelModal = () => {
    setOpenAddCatalogModal(false);
    setModalType("");
  };

  const onOpenAddCatalogModal = (type: string, catalog?: any) => {
    setDataUserCompute(catalog);
    setOpenAddCatalogModal(true);
    setModalType(type);
  };

  const onDeleteCatalog = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this catalog?",
        onSubmit() {
          try {
            const ar = call("deleteCataModel", {
              params: { id: id.toString() },
            });
            ar.promise.then(() => {
              fetchData();
            });
          } catch (error) {
            const err =
              error instanceof Error ? error.message : "Something when wrong!";
              infoDialog({message: err});
          }
        },
      });
    },
    [call, fetchData]
  );

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Account setting" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const addButtonProps = useMemo((): TButtonProps => {
    return {
      size: "medium",
      type: "gradient",
      icon: <IconPlus />,
      onClick: () => onOpenAddCatalogModal("ADD"),
      children: "Add",
    };
  }, []);

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
    if (!error && catalog && catalog.results && catalog.results.length === 0) {
      return <EmptyContent message="No catalog found" />;
    }
    return null;
  }, [error, catalog, fetchData]);

  return (
    <AdminLayout
      title="Model Catalog"
      actions={
        <Button {...addButtonProps} />
      }
    >
      {
        catalog && catalog.results && catalog.results.length > 0
        ? (
          <Fragment>
            <Table
              columns={[
                { label: "ID", dataKey: "id", align: "RIGHT" },
                { label: "Catalog Title", noWrap: true, dataKey: "name" },
                { label: "Status", noWrap: true, dataKey: "status" },
                { label: "Tag", noWrap: true, dataKey: "tag" },
                {
                  label: "Created At",
                  noWrap: true,
                  renderer: (dataRow: TCompute) => formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
                },
                {
                  align: "RIGHT",
                  noWrap: true,
                  renderer: (dataRow: TCompute) => (
                    <TableActions actions={[
                      {icon: "DELETE", onClick: () => onDeleteCatalog(dataRow.id!)},
                      {icon: "EDIT", onClick: () => onOpenAddCatalogModal("UPDATE", dataRow)},
                    ]} />
                  ),
                }
              ]}
              data={catalog?.results ?? []}
            />
            {catalog.results.length > 0 && catalog.count > 1 &&
              <Pagination
                page={page}
                pageSize={pageSize}
                total={catalog?.count}
                setPage={setPage}
                target="admin/model/catalog"
              />
            }
          </Fragment>
        )
        : (
          errorNode
        )
      }
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} catalog`}
          className="c-add-model__modal"
          open={isOpenAddCatalogModal}
          onCancel={onCancelModal}
        >
          <AddCataModeForm
            data={dataUserCompute}
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

export default Catalog;
