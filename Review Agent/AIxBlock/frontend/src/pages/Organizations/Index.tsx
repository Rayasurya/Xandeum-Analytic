import React, { Suspense, useCallback, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Pagination from "@/components/Pagination/Pagination";
import { useGetListMembers } from "@/hooks/settings/members/useGetListMembers";
import { useUserLayout } from "@/layouts/UserLayout";
import { useAuth } from "@/providers/AuthProvider";
import { formatDateTime } from "@/utils/formatDate";
import "./Index.scss";
import Modal from "@/components/Modal/Modal";
import AddPeopleForm from "./AddPeopleForm/Index";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import Table, { TableActions } from "@/components/Table/Table";
import { useAdminOrganizations } from "@/hooks/organization/useAdminOrganizations";
import { listUserRoles, userRoles } from "@/utils/user";
import AppLoading from "@/components/AppLoading/AppLoading";
import IconSaveDisk from "@/assets/icons/IconSaveDisk";
import Select from "@/components/Select/Select";
import { TUserModel } from "@/models/user";
import {useApi} from "@/providers/ApiProvider";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import InputBase from "@/components/InputBase/InputBase";

const OrganizationsPage = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { user } = useAuth();
  const { dataMembers, page, setPage, fetchData, loading: loadingMembers, error, search, setSearch } = useGetListMembers(
    user?.active_organization ?? 1,
    currentPage ? Number(currentPage) : 1
  );
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  const { addPromise } = usePromiseLoader();
  // useBooleanLoader(loadingMembers, "Loading members list...");
  const { removeMember, updateMember } = useAdminOrganizations();
  const editable = useMemo(() => user && (user.is_organization_admin || user.is_superuser), [user])
  const [isEditing, setIsEditing] = React.useState(false);
  const selectedUserId = useRef<number | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<string | undefined>();
  const {call} = useApi();
  const searchTimeout = useRef<NodeJS.Timeout>();

  const closeModal = () => {
    setOpenModal(false);
    setModalType("");
  };

  const openModal = (type: string) => {
    setOpenModal(true);
    setModalType(type);
  };

  const handleDeleteMember = useCallback(
    async (memberId: number, orgId: number) => {
      confirmDialog({
        title: "Remove member",
        message: "Are you sure you want to remove this member?",
        onSubmit: async () => {
          const ar = removeMember(orgId, memberId);
          addPromise(ar.promise, "Removing member...");
          const res = await ar.promise;

          if (res.ok) {
            fetchData().catch();
          } else {
            infoDialog({ message: `Failed to fetch data. Status: ${res.status}` });
          }
        },
      });
    },
    [removeMember, addPromise, fetchData]
  );

  const onUpdateMember = useCallback((user: any, id: number) => {
    const ar = updateMember(user, id);
    addPromise(ar.promise, "Update member...");

    ar.promise
      .then(r => {
        if (!r.ok) {
          infoDialog({ message: `Failed to fetch data. Status: ${r.status}` });
        }
      });

    return ar;
  }, [updateMember, addPromise]);

  const handleEditMember = (user: TUserModel, membershipId: number) => {
    if (isEditing) {
      if (selectedRole) {
        const ar = call("changeOrganizationMembership", {
          params: {id: membershipId.toString()},
          body: {
            is_admin: selectedRole === "is_organization_admin",
          },
        });

        const newData = {
          ...selectedRole !== '_' ? {
            is_qa: false,
            is_qc: false,
            [selectedRole as string]: true,
          } : {
            is_qa: false,
            is_qc: false,
          }
        }

        const ar2 = onUpdateMember(newData, user.id);

        Promise.all([ar.promise, ar2.promise])
          .then(fetchData)
          .catch(e => {
            if (window.APP_SETTINGS.debug) {
              console.error(e);
            }
          });
      }

      setIsEditing(false);
    } else {
      selectedUserId.current = user.id;
      setIsEditing(true);
    }
  };

  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Organizations" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const onChange = React.useCallback((v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 500);
  }, [setSearch]);

  React.useEffect(() => {
    return () => {
      clearTimeout(searchTimeout.current);
    }
  }, []);

  if (error) {
    return <EmptyContent message={error} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => fetchData(),
      }
    ]} />
  }

  if (!dataMembers) {
    return <>No results</>;
  }

  return (
    <div className="p-organizations-manage">
      <div className="p-organizations-manage__actions">
        <Button
          className="p-organizations-manage__actions--setting"
          size="small"
          icon={ <IconPlus/> }
          onClick={ () => openModal("add-bulk") }
        >
          Add members using CSV
        </Button>
        <Button
          className="p-organizations-manage__actions--add"
          size="small"
          icon={ <IconPlus/> }
          onClick={ () => openModal("invite") }
        >
          Add member
        </Button>
      </div>
      <div
        style={ { marginBottom: 16 } }
      >
        <InputBase
          placeholder="Enter username, email, name... to search"
          value={ search }
          allowClear={false}
          onChange={ ev => {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => {
              setSearch(ev.target?.value.trim() ?? "");
            }, 1000);
          } }
          onKeyUp={ ev => {
            if (ev.key === "Enter") {
              onChange(ev.currentTarget.value.trim());
            }
          } }
          onBlur={ ev => {
            onChange(ev.currentTarget.value.trim());
          } }
        />
      </div>
      {loadingMembers && (
        <EmptyContent message="Loading..." />
      )}
      {!loadingMembers && (
        <>
          <Table
            columns={ [
              {
                label: "Email",
                noWrap: true,
                renderer: (dataRow) => <span>{ dataRow.user.email }</span>,
              },
              {
                label: "Name",
                noWrap: true,
                renderer: (dataRow) => <span>{ dataRow.user.username ?? "-" }</span>,
              },
              {
                label: "Role",
                noWrap: true,
                renderer: (dataRow) => isEditing && selectedUserId.current === dataRow.user.id
                  ? (
                    <Select
                      isSelectGroup={ false }
                      data={ [
                        {
                          label: "",
                          options: listUserRoles.filter((item) => item.value !== "is_superuser")
                        }
                      ] }
                      onChange={ (data) => {
                        setSelectedRole(data.value);
                      } }
                    />
                  ) : (
                    <span>{ userRoles(dataRow.user, dataRow.is_admin).join(", ") }</span>
                  ),
              },
              {
                label: "Last Activity",
                noWrap: true,
                renderer: (dataRow) => (
                  <span>{ formatDateTime(dataRow.user.last_activity) }</span>
                ),
              },
              {
                align: "RIGHT",
                noWrap: true,
                renderer: (dataRow) =>
                  dataRow.user.id === user?.id ? (
                    <span>You</span>
                  ) : (
                    <TableActions
                      actions={
                        editable ? [
                          {
                            icon: isEditing ? <IconSaveDisk width={ 18 } height={ 18 }/> : "EDIT",
                            onClick: () => handleEditMember(dataRow.user, dataRow.id),
                          },
                          {
                            icon: "DELETE",
                            onClick: () => handleDeleteMember(dataRow.user.id, dataRow.organization),
                          },
                        ] : [
                          {
                            icon: "DELETE",
                            onClick: () => handleDeleteMember(dataRow.user.id, dataRow.organization),
                          },
                        ]
                      }
                    />
                  ),
              },
            ] }
            data={ dataMembers?.results ?? [] }
          />
          {(dataMembers?.count ?? 0) > 9 && (
            <div className="data-import-list__pagination">
              <Pagination
                page={ page }
                pageSize={ 9 }
                total={ dataMembers?.count ?? 0 }
                setPage={ setPage }
                target="user/organization"
              />
            </div>
          )}
        </>
      )}
      <Suspense fallback={ <AppLoading/> }>
        <Modal
          open={ isOpenModal }
          title={ (modalType === "add-bulk" || modalType === "add-people") ? "New member" : "Add member" }
          icon={ <IconPlus/> }
          className="p-organizations-manage--add-people"
          onCancel={ closeModal }
        >
          <AddPeopleForm
            activeOrg={ user?.active_organization ?? 1 }
            refetch={ fetchData }
            formType={ modalType }
            onFinish={ closeModal }
            setAddMethod={ setModalType }
          />
        </Modal>
      </Suspense>
    </div>
  );
};

export default OrganizationsPage;
