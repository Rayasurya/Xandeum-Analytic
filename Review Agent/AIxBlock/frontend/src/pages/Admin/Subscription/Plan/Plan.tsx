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
// import { TOrganizationsAdmin } from "@/models/organizationsAdmin";
// import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table/*, { TableActions }*/ from "@/components/Table/Table";
import AppLoading from "@/components/AppLoading/AppLoading";

const Plan = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  // const { call } = useApi();
  // const { user } = useAuth();
  const { plan, page, pageSize, setPage, /*fetchData,*/ loading } =
    useGetSubscription({
      page: currentPage ? Number(currentPage) : 1,
    });
  const [isOpenAddPlanModal, setOpenAddPlanModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  // const [dataUserPlan, setDataUserPlan] = useState<TOrganizationsAdmin | null>(null);
  useBooleanLoader(loading, "Loading Plan...");

  const onCancelModal = () => {
    setOpenAddPlanModal(false);
    setModalType("");
  };

  // const onOpenAddPlanModal = (type: string, plan?: TOrganizationsAdmin) => {
  //   if (plan) {
  //     setDataUserPlan(plan);
  //   }
  //   setOpenAddPlanModal(true);
  //   setModalType(type);
  // };

  /*const onDeletePlan = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this plan?",
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

  if (!plan || !plan.results) {
    return <p className="no-results">No plan found</p>;
  }

  return (
    <AdminLayout
      title="Select plan to change"
      /*actions={
        <Button size="medium" type="gradient" icon={<IconPlus />} onClick={() => onOpenAddPlanModal("ADD")}>
          Add
        </Button>
      }*/
    >
      <Table
        columns={[
          {label: "ID", dataKey: "id", align: "RIGHT"},
          {label: "Plan Title", noWrap: true, dataKey: "title"},
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
            renderer: (dataRow) => formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
          },
          {
            align: "RIGHT",
            noWrap: true,
            // renderer: (dataRow) => (
            //   <TableActions actions={[
            //     user?.id !== dataRow.id ? {icon: "DELETE", onClick: () => onDeletePlan(dataRow.id)} : {icon: ""},
            //     {icon: "EDIT", onClick: () => onOpenAddPlanModal("UPDATE", dataRow)},
            //   ]} />
            // ),
          }
        ]}
        data={plan?.results ?? []}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={plan?.count}
        setPage={setPage}
        target="admin/subscription/plan"
      />
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${modalType === "UPDATE" ? "Update" : "Add"} plan`}
          className="c-add-subscription__modal"
          open={isOpenAddPlanModal}
          onCancel={onCancelModal}
        >
          {/*<AddOrgForm
            data={dataUserPlan}
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

export default Plan;
