import React, { useEffect, useState } from "react";
import { useUserLayout } from "@/layouts/UserLayout";
import Pagination from "@/components/Pagination/Pagination";
import { formatDateTime } from "@/utils/formatDate";
import AdminLayout from "../Layout";
import Table from "@/components/Table/Table";
import { TUserModel } from "@/models/user";

import EmptyContent from "@/components/EmptyContent/EmptyContent";
import useActivityHook from "@/hooks/admin/activity/useActivityHook";

const Activity = () => {
  const userLayout = useUserLayout();
  const {
    list,
    loading,
    loadingError,
    page,
    pageSize,
    total,
    refresh,
    setPage,
  } = useActivityHook();
  const [formUser, setFormUser] = useState<TUserModel | null>();
  const openModal = !!formUser;

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Account setting" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  useEffect(() => {
    if (!openModal) {
      setFormUser(undefined);
    }
  }, [openModal]);

  const errorNode = React.useMemo(() => {
    if (loadingError) {
      return (
        <EmptyContent
          message={loadingError}
          buttons={[
            {
              children: "Retry",
              type: "hot",
              onClick: () => refresh(),
            },
          ]}
        />
      );
    }
    if (!loadingError && list && list.length === 0 && !loading) {
      return <EmptyContent message="No user found" />;
    }
    return null;
  }, [loadingError, list, loading, refresh]);

  return (
    <AdminLayout title="View all activities">
      {loading && <EmptyContent message="Loading..." />}
      {!loading && list && list.length > 0 ? (
        <>
          <Table
            columns={[
              { label: "ID", dataKey: "activityId", align: "RIGHT" },
              {
                label: "Transaction Hash ",
                noWrap: true,
                renderer: (dataRow: any) => (
                  <a
                    href={`https://solscan.io/tx/${dataRow.txnHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dataRow.txnHash}
                  </a>
                ),
              },
              {
                label: "IPFS",
                noWrap: true,
                renderer: (dataRow: any) => (
                  <a
                    href={`https://ipfs.io/ipfs/${dataRow.hashIpfs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dataRow.hashIpfs}
                  </a>
                ),
              },
              {
                label: "Created At",
                noWrap: true,
                renderer: (dataRow: any) => formatDateTime(dataRow.createdAt!),
              },
            ]}
            data={list}
            className="table-user"
          />
          {total > 1 && (
            <Pagination
              disabled={loading}
              page={page}
              pageSize={pageSize}
              total={total}
              setPage={setPage}
              target={"admin/activity"}
            />
          )}
        </>
      ) : (
        errorNode
      )}
    </AdminLayout>
  );
};

export default Activity;
