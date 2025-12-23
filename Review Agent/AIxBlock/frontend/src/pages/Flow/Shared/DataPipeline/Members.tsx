import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import Modal from "@/components/Modal/Modal";
import Spin from "@/components/Spin/Spin";
import { useAdminOrganizations } from "@/hooks/organization/useAdminOrganizations";
import {
  TOrganizationUser,
  useGetListMembers,
} from "@/hooks/settings/members/useGetListMembers";
import { TProjectModel } from "@/models/project";
import { useAuth } from "@/providers/AuthProvider";
import { usePromiseLoader } from "@/providers/LoaderProvider";
import MemberItem from "./MemberItem/MemberItem";
import styles from "./Members.module.scss";
import AddPeopleForm from "../../../Organizations/AddPeopleForm/Index";
import AppLoading from "@/components/AppLoading/AppLoading";
import { useApi } from "@/providers/ApiProvider";
import Pagination from "@/components/Pagination/Pagination";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import InputBase from "@/components/InputBase/InputBase";

export type TUploadCSVParams = {
  csv_file: File | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  organizationId?: string;
  project_id?: string;
};

type TProps = {
  project: TProjectModel;
};

const MODAL_TYPE = {
  1: "invite",
  2: "add-bulk",
};

const Members = ({ project }: TProps) => {
  const { user } = useAuth();
  const {
    dataMembers,
    loading: loadingListMembers,
    page,
    setPage,
    error,
    fetchData,
    search,
    setSearch,
  } = useGetListMembers(
    user?.active_organization ?? 1,
    1,
    10,
    project.id,
  );
  const { call } = useApi();
  const { addPromise } = usePromiseLoader();
  const { removeMember } = useAdminOrganizations();
  const [isOpenMemberModal, setOpenMemberModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();

  const closeModal = () => {
    setOpenMemberModal(false);
    setModalType("");
  };

  const onOpenMemberModal = (type: string, item?: TOrganizationUser) => {
    // item && setDataMember(item);
    setOpenMemberModal(true);
    setModalType(type);
  };

  const onDeleteMember = useCallback(
    async (memberId: number, orgId: number) => {
      confirmDialog({
        title: "Remove member",
        message: "Are you sure you want to remove this member?",
        onSubmit: async () => {
          const ar = removeMember(orgId, memberId, project.id);
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
    [removeMember, project.id, addPromise, fetchData]
  );

  const onUpdateMember = useCallback(
    async (user: any) => {
      try {
        const ar = call("updateUser", {
          params: { id: user.id.toString() ?? "" },
          query: new URLSearchParams({
            project_id: project.id?.toString()
          }),
          body: {
            is_qa: user.is_qa,
            is_qc: user.is_qc,
          },
        });

        const res = await ar.promise;

        if (res.ok) {
          await fetchData();
        }
      } catch (error) {
        const err = error instanceof Error ? error.message : "Something when wrong!";
        infoDialog({ message: err });
      }
    },
    [call, fetchData, project.id]
  );

  const canManageOrganization = useMemo(() => user?.is_superuser || user?.is_organization_admin, [user]);

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
    return <div className="loading-error">
      <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => fetchData(),
        }
      ]} />
    </div>
  }

  return (
    <div>
      <div>
        {canManageOrganization && (
          <div className={ styles.list }>
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
            { loadingListMembers && (
              <Spin loading={ loadingListMembers } size="sm"/>
            ) }
            { !loadingListMembers && (
              <div className={ styles.table }>
                <div className={ styles.thead }>
                  <div className={ styles.theadName }>Email</div>
                  <div className={ styles.theadName }>Role</div>
                  <div className={ styles.theadName }>Action</div>
                </div>
                { dataMembers?.results?.map((member) => (
                  <MemberItem
                    key={ `key-${ member?.id }` }
                    data={ member.user }
                    user={ user }
                    orgId={ member.organization }
                    onRemove={ onDeleteMember }
                    isYou={ member.user.id === user?.id }
                    onEditMember={ onUpdateMember }
                  />
                )) }
                { (dataMembers?.count ?? 0) > 10 && (
                  <Pagination page={ page } pageSize={ 10 } setPage={ setPage } total={ dataMembers?.count ?? 0 }/>
                ) }
              </div>
            )}
            <div className={ styles.action }>
              <Button
                onClick={ () => onOpenMemberModal(MODAL_TYPE[1]) }
                type="secondary"
                icon={ <IconPlus/> }
                className={ styles.add }
              >
                Add more labeler
              </Button>
              <Button
                onClick={ () => onOpenMemberModal(MODAL_TYPE[2]) }
                type="primary"
                icon={ <IconPlus/> }
                className={ styles.csv }
              >
                Add Using CSV
              </Button>
            </div>
          </div>
        ) }
        { !canManageOrganization && (
          <EmptyContent hideIcon={ true } message="Only admin can manage member list"/>
        ) }
      </div>
      <Suspense fallback={ <AppLoading/> }>
        <Modal
          open={ isOpenMemberModal }
          title={ `${ modalType === MODAL_TYPE[1] ? "Add Member" : "Add members using CSV" }` }
          onCancel={ closeModal }
        >
          <AddPeopleForm
            activeOrg={user?.active_organization ?? 1}
            refetch={fetchData}
            formType={modalType}
            onFinish={closeModal}
            setAddMethod={setModalType}
            projectID={project.id}
          />
        </Modal>
      </Suspense>
    </div>
  );
};

export default Members;
