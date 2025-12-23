import React, { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import Pagination from "@/components/Pagination/Pagination";
import Table, { TableActions } from "@/components/Table/Table";
import {
  TComputeSupply,
  useGetListComputeMarketplace,
} from "@/hooks/computes/useGetListComputeMarketplace";
import { useUserLayout } from "@/layouts/UserLayout";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import "./Index.scss";

const ComputesPage = () => {
  const userLayout = useUserLayout();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { call } = useApi();
  const currentPage = searchParams.get("page");

  const { listData, loading, fetchData, page, setPage } =
    useGetListComputeMarketplace({
      page: currentPage ? Number(currentPage) : 1,
      type: "rented",
    });
  useBooleanLoader(loading, "Loading list rented...");

  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Computes" }]);
    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const onDeleteCompute = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this compute?",
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
            infoDialog({ message: err });
          }
        },
      });
    },
    [call, fetchData]
	);

  return (
    <div className="p-computes">
      <div className="p-computes__actions">
        <Button
          className="p-computes__actions--add"
          size="medium"
          icon={<IconPlus />}
          onClick={() => navigate(`/computes/add`)}
        >
          Add computes
        </Button>
      </div>
      <Table
        columns={[
          {
            label: "Status",
            dataKey: "status",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => {
              return (
                <span
                  className={`status ${dataRow.status ? dataRow.status : "-"}`}
                />
              );
            },
          },
          {
            label: "File",
            dataKey: "file",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => {
              if (dataRow.file) {
                return (
                  <img
                    width={20}
                    height={20}
                    src={`${
                      dataRow.file
                        ? dataRow.file
                        : require("@/assets/images/no-avatar.jpg")
                    }`}
                    alt={`${dataRow.name}`}
                  />
                );
              }

              return null;
            },
          },
          { label: "Name", dataKey: "name", noWrap: true },
          { label: "Service", dataKey: "compute_type", noWrap: true },
          {
            label: "IP",
            dataKey: "ip_address",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => {
              if (dataRow.ip_address && dataRow.port) {
                const ml_host = `${dataRow.ip_address}:${dataRow.port}`;
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
          { label: "Port", dataKey: "port", noWrap: true },
          {
            label: "Action",
            align: "RIGHT",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => (
              <TableActions
                actions={[
                  {
                    icon: "DELETE",
                    onClick: () => onDeleteCompute(dataRow.id),
                  },
                ]}
              />
            ),
          },
        ]}
        data={listData?.results ?? []}
      />
      {(listData?.count ?? 0) > 10 && <Pagination
        page={page}
        pageSize={10}
        total={listData?.count ?? 0}
        setPage={setPage}
        target="computes"
      />}
    </div>
  );
};

export default ComputesPage;
