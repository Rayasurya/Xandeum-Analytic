import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { formatDate } from "@/utils/formatDate";
import { useGetCataCompute } from "@/hooks/admin/compute/useCataCompute";
import AddCataCompForm from "./AddCataCompForm/Index";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table, { TableActions } from "@/components/Table/Table";
import { TCatalogCompute } from "@/models/catalogCompute";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import AppLoading from "@/components/AppLoading/AppLoading";

const Catalog = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { call } = useApi();
  const { catalog, page, pageSize, setPage, fetchData, loading, error } =
    useGetCataCompute({
      page: currentPage ? Number(currentPage) : 1,
    });
  const [isOpenAddCatalogModal, setOpenAddCatalogModal] =
    useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  const [dataUserCompute, setDataUserCompute] = useState<TCatalogCompute>();
  useBooleanLoader(loading, "Loading Catalog...");

  const onCancelModal = () => {
    setOpenAddCatalogModal(false);
    setModalType("");
  };

  const onOpenAddCatalogModal = (type: string, catalog?: TCatalogCompute) => {
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
            const ar = call("deleteCataCompute", {
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
    if (catalog?.results.length === 0) {
      return <EmptyContent message="No catalog found" />;
    }
    return null;
  }, [error, fetchData, catalog]);

  return (
    <AdminLayout
      title="Select catalog to change"
      actions={
        <Button size="medium" type="gradient" icon={<IconPlus />} onClick={() => onOpenAddCatalogModal("ADD")}>
          Add
        </Button>
      }
    >
      {catalog && catalog.results && catalog.results.length > 0 ? (
        <>
          <Table
            columns={[
              {label: "ID", dataKey: "id"},
              {label: "Name", noWrap: true, dataKey: "name"},
              {label: "Tag", noWrap: true, dataKey: "tag"},
              {label: "Status", noWrap: true, dataKey: "status"},
              {
                label: "Date Created",
                noWrap: true,
                renderer: (dataRow: TCatalogCompute) => formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
              },
              {
                align: "RIGHT",
                noWrap: true,
                renderer: (dataRow: TCatalogCompute) => (
                  <TableActions actions={[
                    {icon: "DELETE", onClick: () => onDeleteCatalog(dataRow.id!)},
                    {icon: "EDIT", onClick: () => onOpenAddCatalogModal("UPDATE", dataRow)},
                  ]} />
                ),
              }
            ]}
            data={catalog.results}
          />
          {catalog.count > 1 &&
            <Pagination
              page={page}
              pageSize={pageSize}
              total={catalog?.count ?? 0}
              setPage={setPage}
              target="admin/compute/catalog"
            />
          }
        </>
      ) : (  
        errorNode
      )}
      <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} catalog`}
          className="c-add-compute__modal"
          open={isOpenAddCatalogModal}
          onCancel={onCancelModal}
        >
          <AddCataCompForm
            data={dataUserCompute}
            type={modalType}
            refetch={fetchData}
            onClose={onCancelModal}
          />
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default Catalog;
