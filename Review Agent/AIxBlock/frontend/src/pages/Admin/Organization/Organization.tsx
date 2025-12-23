import React, { Suspense, useCallback, useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import {
  useGetOrganizations,
} from "@/hooks/organization/useGetOrganizations";
import { useUserLayout } from "@/layouts/UserLayout";
import { useApi } from "@/providers/ApiProvider";
import {formatDateTime} from "@/utils/formatDate";
import AddOrgForm from "./Form/Index";
import { useAuth } from "@/providers/AuthProvider";
import { popupCenter } from "@/utils/popupCenter";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import { TOrganizationsAdmin } from "@/models/organization";
import AdminLayout from "../Layout";
import Table, {TableActions} from "@/components/Table/Table";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import AppLoading from "@/components/AppLoading/AppLoading";
import UserName from "@/components/UserName/UserName";

export const newOrganization: TOrganizationsAdmin = {
  id: 0,
  title: "",
  token: Math.random().toString().substring(2, 6),
  team_id: Math.random().toString().substring(2, 6),
  created_at: "",
  created_by: 0,
  updated_at: "",
  user: [],
}

const Organization = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { call } = useApi();
  const { user } = useAuth();
  const { error, organizations, page, pageSize, setPage, fetchData, loading: loadingOrganizations } =
    useGetOrganizations({
    page: currentPage ? Number(currentPage) : 1,
  });
  const [isOpenForm, setOpenForm] = useState<boolean>(false);
  const [organization, setOrganization] = useState<TOrganizationsAdmin>(newOrganization);
  useBooleanLoader(loadingOrganizations, "Loading organizations...");

  const onCancelModal = () => {
    setOpenForm(false);
  };

  const openForm = (org: TOrganizationsAdmin) => {
    if (org) {
      setOrganization(org);
    }

    setOpenForm(true);
  };

  const onDeleteOrg = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this organization?",
        onSubmit() {
          try {
            const ar = call("adminOrgDelete", {
              params: { id: id.toString() },
            });

            ar.promise.then(fetchData);
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

  const errorNode = React.useMemo(() => {
    if (error) {
      return <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => fetchData(),
        }
      ]} />;
    }
    if (organizations?.results.length === 0) {
      return <EmptyContent message="No organizations found" />;
    }
    return null;
  }, [error, organizations, fetchData]);

  return (
    <AdminLayout
      title="Organizations"
      actions={<>
        <Button size="medium" type="gradient" icon={<IconPlus />} onClick={() => openForm({...newOrganization})}>
            Add
          </Button>
        </>
      }
    >
      {organizations &&
      organizations.results &&
      organizations.results.length > 0 ? (
        <>
          <Table
            columns={[
              { label: "ID", dataKey: "id", align: "RIGHT" },
              { label: "Name", dataKey: "title", noWrap: true },
              {
                label: "Creator",
                dataKey: "created_by",
                noWrap: true,
                renderer: (dataRow: TOrganizationsAdmin) => dataRow.created_by ? <UserName userID={dataRow.created_by} /> : "",
              },
              {
                label: "Date Created",
                noWrap: true,
                renderer: (dataRow: TOrganizationsAdmin) =>
                  formatDateTime(dataRow["created_at"]),
              },
              {
                align: "RIGHT",
                noWrap: true,
                renderer: (dataRow: TOrganizationsAdmin) => (
                  <TableActions
                    actions={[
                      {
                        icon: "EXPORT",
                        onClick: () =>
                          popupCenter(
                            "/organization/report",
                            "Export Report",
                            200,
                            150
                          ),
                      },
                      {
                        icon: "DELETE",
                        onClick: () => onDeleteOrg(dataRow.id),
                        disabled: user?.active_organization === dataRow.id,
                      },
                      { icon: "EDIT", onClick: () => openForm(dataRow) },
                    ]}
                  />
                ),
              },
            ]}
            data={organizations?.results ?? []}
          />
          {organizations.count > 1 &&
            <Pagination
              page={page}
              pageSize={pageSize}
              total={organizations.count ?? 0}
              setPage={setPage}
              target="admin/organization"
            />
          }
        </>
      ) : (
        errorNode
      )}
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={((organization?.id ?? 0) > 0 ? "Update" : "Add") + " organization"}
          className="c-add-org__modal"
          open={isOpenForm}
          onCancel={onCancelModal}
        >
          <AddOrgForm
            data={organization}
            refetch={fetchData}
            onClose={onCancelModal}
            currentUserId={user?.id}
          />
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default Organization;
