import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import { useGetCompute } from "@/hooks/admin/compute/useCompute";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { formatDate } from "@/utils/formatDate";
import AddCompForm from "./AddCompForm/Index";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table, { TableActions } from "@/components/Table/Table";
import { TComputeMarketplace } from "@/models/computeMarketplace";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import AppLoading from "@/components/AppLoading/AppLoading";

const Computes = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { call } = useApi();
  const { computes, page, pageSize, setPage, fetchData, loading, error } =
    useGetCompute({
      page: currentPage ? Number(currentPage) : 1,
      status: null,
    });
  const [isOpenAddComputesModal, setOpenAddComputesModal] =
    useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  const [dataUserCompute, setDataUserCompute] = useState<TComputeMarketplace>();
  useBooleanLoader(loading, "Loading Computes...");

  const onCancelModal = () => {
    setOpenAddComputesModal(false);
    setModalType("");
  };

  const onOpenAddComputesModal = (type: string, computes?: TComputeMarketplace) => {
    setDataUserCompute(computes);
    setOpenAddComputesModal(true);
    setModalType(type);
  };

  const onDeleteComputes = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this computes?",
        onSubmit() {
          try {
            const ar = call("deleteCompute", {
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
    if (computes?.results.length === 0) {
      return <EmptyContent message="No computes found" />;
    }
    return null;
  }, [error, fetchData, computes]);

  return (
    <AdminLayout
      title="Select computes to change"
      actions={
        <Button size="medium" type="gradient" icon={<IconPlus />} onClick={() => onOpenAddComputesModal("ADD")}>
          Add
        </Button>
      }
    >
      {computes && computes.results && computes.results.length > 0 ? (
        <>
          <Table
            columns={[
              {label: "ID", dataKey: "id"},
              {label: "Name", noWrap: true, dataKey: "name"},
              {label: "Status", noWrap: true, dataKey: "status"},
              {
                label: "Date Created",
                noWrap: true,
                renderer: (dataRow: TComputeMarketplace) => formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
              },
              {
                align: "RIGHT",
                noWrap: true,
                renderer: (dataRow: TComputeMarketplace) => (
                  <TableActions actions={[
                    {icon: "DELETE", onClick: () => onDeleteComputes(dataRow.id)},
                    {icon: "EDIT", onClick: () => onOpenAddComputesModal("UPDATE", dataRow)},
                  ]} />
                ),
              }
            ]}
            data={computes.results}
          />
          {computes.count > 1 &&
            <Pagination
              page={page}
              pageSize={pageSize}
              total={computes.count ?? 0}
              setPage={setPage}
              target="admin/compute/computes"
            />
          }
        </>
      ) : (
        errorNode
      )}
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} computes`}
          className="c-add-compute__modal"
          open={isOpenAddComputesModal}
          onCancel={onCancelModal}
        >
          <AddCompForm
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

export default Computes;
