import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlus from "@/assets/icons/IconPlus";
import useUsersHook from "@/hooks/admin/user/useUsersHook";
import IconActive from "@/assets/icons/IconActive";
import IconDeActive from "@/assets/icons/IconDeActive";
import Pagination from "@/components/Pagination/Pagination";
import FormModal from "./FormModal";
import UploadCSVUserModal from "./UploadCSVUserModal";
import { formatDateTime } from "@/utils/formatDate";
import Button from "@/components/Button/Button";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../Layout";
import Table, { TableActions } from "@/components/Table/Table";
import { newUser, TUserModel } from "@/models/user";
import { useAuth } from "@/providers/AuthProvider";

import EmptyContent from "@/components/EmptyContent/EmptyContent";
import { CSVLink } from "react-csv";
import { Tooltip } from "react-tooltip";
import IconExport from "@/assets/icons/IconExport";
import { LabelKeyObject } from "react-csv/lib/core";
import "./Index.scss";
import InputBase from "@/components/InputBase/InputBase";
import { userRoles } from "@/utils/user";
import { openNewTab } from "@/utils/openNewTab";

const User = () => {
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
    search,
    setSearch,
  } = useUsersHook();
  const { call } = useApi();
  const [openCSVModal, setOpenCSVModal] = useState(false);
  const [formUser, setFormUser] = useState<TUserModel | null>();
  const {addPromise} = usePromiseLoader();
  const openModal = !!formUser;
  const {user} = useAuth();
  const searchTimeout = useRef<NodeJS.Timeout>();

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

  const handleDeleteUser = React.useCallback((id: number) => {
    confirmDialog({
      message: "Are you sure you want to delete this user?",
      onSubmit() {
        const ar = call("deleteUsers", { params: { id: id.toString() } });
        addPromise(ar.promise, "Deleting user...");
        ar.promise.then((res) => {
          if (res.ok) {
            refresh();
          } else {
            infoDialog({message: "An error occurred while delete user."});
          }
        });
      },
    });
  }, [call, refresh, addPromise]);


  const headers = useMemo(() => {
    if (!list || list.length === 0) {
      return []
    }
    const result: LabelKeyObject[] = [];

    for (const [key] of Object.entries(list[0])) {
      result.push({
        label: key,
        key: key
      })
    }
    return result;
  }, [list]);
  
  const errorNode = React.useMemo(() => {
    if (loadingError) {
      return <EmptyContent message={loadingError} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refresh(),
        }
      ]} />;
    }
    if (!loadingError && list && list.length === 0 && !loading) {
      return <EmptyContent message="No user found" />;
    }
    return null;
  }, [loadingError, list, loading, refresh]);

  const onChange = React.useCallback((v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 500);
  }, [setSearch]);

  React.useEffect(() => {
    return () => {
      clearTimeout(searchTimeout.current);
    }
  }, []);

  return (
    <AdminLayout
      title="Select user to change"
      actions={<>
        <Button type="secondary" onClick={() => openNewTab("/api/user/export-all")}>
          Export CSV
        </Button>
        <Button type="gradient" icon={<IconPlus />} onClick={() => setOpenCSVModal(true)}>
          CSV
        </Button>
        <Button type="gradient" icon={<IconPlus />} onClick={() => setFormUser({ ...newUser })}>
          Add
        </Button>
      </>
      }
    >
      <div
        style={{ marginBottom: 16 }}
      >
        <InputBase
          placeholder="Enter username, email, name... to search"
          value={search}
          allowClear={false}
          onChange={ ev => {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => {
              setSearch(ev.target?.value.trim() ?? "");
            }, 1000);
          } }
          onKeyUp={ev => {
            if (ev.key === "Enter") {
              onChange(ev.currentTarget.value.trim());
            }
          }}
          onBlur={ev => {
            onChange(ev.currentTarget.value.trim());
          }}
        />
      </div>
      {loading && (
        <EmptyContent message="Loading..." />
      )}
      {!loading && list && list.length > 0 ? (
        <>
          <Table
            columns={[
              { label: "ID", dataKey: "id", align: "RIGHT" },
              { label: "Email Address", dataKey: "email", noWrap: true },
              { label: "Username", dataKey: "username", noWrap: true },
              {
                label: "Active Organization",
                dataKey: "active_organization",
                noWrap: true,
                renderer: (dataRow: TUserModel) => dataRow.active_organization ? "#" + dataRow.active_organization : "",
              },
              {
                label: "Active",
                renderer: (dataRow: TUserModel) =>
                  dataRow.is_active ? <IconActive /> : <IconDeActive />,
              },
              {
                label: "Roles",
                renderer: (dataRow: TUserModel) => userRoles(dataRow, false).join(", "),
              },
              // {
              //   label: "Superuser",
              //   renderer: (dataRow: TUserModel) =>
              //     dataRow.is_superuser ? <IconActive /> : <IconDeActive />,
              // },
              // {
              //   label: "QA",
              //   renderer: (dataRow: TUserModel) =>
              //     dataRow.is_qa ? <IconActive /> : <IconDeActive />,
              // },
              // {
              //   label: "QC",
              //   renderer: (dataRow: TUserModel) =>
              //     dataRow.is_qc ? <IconActive /> : <IconDeActive />,
              // },
              {
                label: "Date Joined",
                noWrap: true,
                renderer: (dataRow: TUserModel) =>
                  formatDateTime(dataRow.date_joined!),
              },
              {
                align: "RIGHT",
                noWrap: true,
                className: "flex align-center justify-end",
                renderer: (dataRow: TUserModel) => (
                  <TableActions
                    actions={[
                      {
                        icon: <CSVLink
                          data={[dataRow]}
                          headers={headers}
                          className="csv-export-user"
                          filename={`user-${dataRow.id}`}
                          id="export-csv"
                        >
                          <IconExport />
                          <Tooltip place="top" positionStrategy="fixed" content="Export csv"
                            anchorSelect={"#export-csv"} />
                        </CSVLink>,
                      },
                      {
                        icon: "DELETE",
                        disabled: dataRow.id === user?.id,
                        onClick: () => handleDeleteUser(dataRow.id!),
                      },
                      {
                        icon: "EDIT",
                        onClick: () => {
                          setFormUser(dataRow);
                        },
                      },
                    ]}
                  />
                ),
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
              target={"admin/user"}
            />
          )}
        </>
      ) : (errorNode)}
      {formUser && (
        <FormModal
          isOpenModal={openModal}
          data={formUser}
          setCloseModal={() => setFormUser(null)}
          onSaved={() => {
            setFormUser(null);
            refresh();
          }}
        />
      )}
      <UploadCSVUserModal
        key={Math.random().toString()}
        isOpenModal={openCSVModal}
        setCloseModal={() => setOpenCSVModal(false)}
      />
    </AdminLayout>
  );
};

export default User;
