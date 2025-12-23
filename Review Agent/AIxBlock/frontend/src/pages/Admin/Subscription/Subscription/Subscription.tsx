import { Suspense, /*useCallback,*/ useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
// import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
// import { useApi } from "@/providers/ApiProvider";
// import { useAuth } from "@/providers/AuthProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { formatDate } from "@/utils/formatDate";
import { popupCenter } from "@/utils/popupCenter";
// import AddOrgForm from "../../Organization/AddOrgForm/Index";
import {
  useGetSubscription,
} from "@/hooks/subscription/useSubscription";
import "../../Subscription/Subscription.scss";
import { TOrganizationsAdmin } from "@/models/organization";
// import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table/*, { TableActions }*/ from "@/components/Table/Table";
import AppLoading from "@/components/AppLoading/AppLoading";

const Subscription = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  // const { call } = useApi();
  // const { user } = useAuth();
  const { subscription, page, pageSize, setPage, /*fetchData,*/ loading } =
    useGetSubscription({
      page: currentPage ? Number(currentPage) : 1,
    });
  const [isOpenAddSubscriptionModal, setOpenAddSubscriptionModal] =
    useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  // const [dataUserSubscription, setDataUserSubscription] =
  //   useState<TOrganizationsAdmin | null>(null);
  useBooleanLoader(loading, "Loading Subscription...");

  const onCancelModal = () => {
    setOpenAddSubscriptionModal(false);
    setModalType("");
  };

  // const onOpenAddSubscriptionModal = (
  //   type: string,
  //   subscription?: TOrganizationsAdmin
  // ) => {
  //   if (subscription) {
  //     setDataUserSubscription(subscription);
  //   }
  //   setOpenAddSubscriptionModal(true);
  //   setModalType(type);
  // };

  /*const onDeleteSubscription = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this subscription?",
        onSubmit() {
          try {
            const ar = call("adminOrgDelete", {
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
  );*/

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Account setting" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  if (!subscription || !subscription.results) {
    return <p className="no-results">No subscription found</p>;
  }

  return (
    <AdminLayout
      title="Select subscription to change"
      /*actions={
        <Button size="medium" type="gradient" icon={<IconPlus />} onClick={() => onOpenAddSubscriptionModal("ADD")}>
          Add
        </Button>
      }*/
    >
      <Table
        columns={[
          {label: "ID", dataKey: "id", align: "RIGHT"},
          {label: "Subscription Title", noWrap: true, dataKey: "title"},
          {renderer: () => (
            <Button
              className="data-import-list__actions--export"
              size="small"
              onClick={() =>
                popupCenter(
                  "/organization/report",
                  "Export Report",
                  200,
                  150
                )
              }
            >
              Export Report
            </Button>
          )},
          {label: "Created By", noWrap: true, dataKey: "created_by"},
          {
            label: "Created At",
            noWrap: true,
            renderer: (dataRow: TOrganizationsAdmin) => formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
          },
          {
            align: "RIGHT",
            noWrap: true,
            /*renderer: (dataRow: TOrganizationsAdmin) => (
              <TableActions actions={[
                user?.id !== dataRow.id ? {icon: "DELETE", onClick: () => onDeleteSubscription(dataRow.id)} : {icon: ""},
                {icon: "EDIT", onClick: () => onOpenAddSubscriptionModal("UPDATE", dataRow)},
              ]} />
            ),*/
          }
        ]}
        data={subscription?.results ?? []}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={subscription?.count}
        setPage={setPage}
        target="admin/subscription/subscription"
      />
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} subscription`}
          className="c-add-subscription__modal"
          open={isOpenAddSubscriptionModal}
          onCancel={onCancelModal}
        >
          {/*<AddOrgForm
            data={dataUserSubscription}
            type={modalType}
            active_org={user?.active_organization}
            refetch={fetchData}
            onClose={onCancelModal}
          />*/}
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default Subscription;
