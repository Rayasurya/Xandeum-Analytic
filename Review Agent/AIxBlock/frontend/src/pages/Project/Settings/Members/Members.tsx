import {Suspense, useCallback, useMemo, useState} from "react";
import IconPlusSquare from "@/assets/icons/IconPlusSquare";
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
import LayoutSettings from "../LayoutSettings/Index";
import MemberItem from "./MemberItem/Index";
import "./Members.scss";
import AddPeopleForm from "../../../Organizations/AddPeopleForm/Index";
import {useNavigate, useSearchParams, useParams} from "react-router-dom";
import AppLoading from "@/components/AppLoading/AppLoading";
import { useApi } from "@/providers/ApiProvider";
import Pagination from "@/components/Pagination/Pagination";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

export type TUploadCSVParams = {
  csv_file: File | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  organizationId?: string;
  project_id?: string;
};

type TMembersProps = {
  data?: TProjectModel | null;
};

const MODAL_TYPE = {
  1: "invite",
  2: "add-bulk",
};

const Members = (props: TMembersProps) => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const currentPage = searchParams.get("page");
  const { user } = useAuth();
  const projectID = parseInt(params.projectID ?? "0");
  const {
    dataMembers,
    loading: loadingListMembers,
    fetchData: refetch,
    page,
    setPage,
    error,
    fetchData,
  } = useGetListMembers(
    user?.active_organization ?? 1,
    currentPage ? Number(currentPage) : 1,
    10,
    projectID
  );
  const navigate = useNavigate();
  const { call } = useApi();
  const { addPromise } = usePromiseLoader();
  const { removeMember } = useAdminOrganizations();
  const [isOpenMemberModal, setOpenMemberModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState("");
  // const [_, setDataMember] = useState<TOrganizationUser | null>(null);

  const closeModal = () => {
    // setDataMember(null);
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
          const ar = removeMember(orgId, memberId);
          addPromise(ar.promise, "Removing member...");
          const res = await ar.promise;

          if (res.ok) {
            refetch().catch();
          } else {
            infoDialog({ message: `Failed to fetch data. Status: ${res.status}` });
          }
        },
      });
    },
    [removeMember, addPromise, refetch]
  );

  const onUpdateMember = useCallback(
    async (user: any) => {
      try {
        const ar = call("updateUser", {
          params: { id: user.id.toString() ?? "" },
          body: {
            is_compute_supplier: user.is_compute_supplier,
            is_model_seller: user.is_model_seller,
            is_labeler: user.is_labeler,
            is_organization_admin: user.is_organization_admin,
            is_qa: user.is_qa,
            is_qc: user.is_qc,
            is_superuser: user.is_superuser,
          },
        });

        ar.promise.then((res) => {
          if (res.ok) {
            infoDialog({ message: "Update successfully" });
            refetch();
          }
        });
      } catch (error) {
        const err =
          error instanceof Error ? error.message : "Something when wrong!";
        infoDialog({ message: err });
      }
    },
    [call, refetch]
  );

  const canManageOrganization = useMemo(() => user?.is_superuser || user?.is_organization_admin, [user]);

  if (error) {
    return <div className="c-members m-229 loading-error">
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
    <div className="c-content-settings">
      <div className="c-members m-303">
        {canManageOrganization && (
          <div className="c-members__list">
            <div className="c-members__heading">
              <h4 className="c-members__list-title">List member</h4>
              <button onClick={() => onOpenMemberModal(MODAL_TYPE[2])}>
                Add Using CSV
                <IconPlusSquare />
              </button>
              <button onClick={() => onOpenMemberModal(MODAL_TYPE[1])}>
                Add
                <IconPlusSquare />
              </button>
            </div>
            {loadingListMembers ? (
              <Spin loading={loadingListMembers} size="sm" />
            ) : (
              <>
                <div className="c-members__list-table">
                  <div className="c-members__head">
                    <div className="c-members__head-name">Email</div>
                    <div className="c-members__head-name">Role</div>
                    <div className="c-members__head-name">Action</div>
                  </div>
                  {dataMembers?.results?.map((member) => (
                    <MemberItem
                      key={`key-${member?.id}`}
                      data={member.user}
                      user={user}
                      orgId={member.organization}
                      onRemove={onDeleteMember}
                      isYou={member.user.id === user?.id}
                      onEditMember={(user) => { onUpdateMember(user) }}
                    />
                  ))}
                  {dataMembers?.count && dataMembers.count > 10 && (
                    <Pagination page={page} pageSize={10} setPage={setPage} total={dataMembers.count} target="projects/272/settings/members" />
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {!canManageOrganization && (
          <EmptyContent hideIcon={true} message="Only admin can manage member list" />
        )}
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/settings/labels`}
        nextUrl={"/projects/" + props.data?.id + `/settings/workflow`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/settings/workflow`)}
      />
      <Suspense fallback={<AppLoading />}>
        <Modal
          open={isOpenMemberModal}
          title={`${modalType === MODAL_TYPE[1] ? "Add Member" : "Add members using CSV"
            }`}
          className={`c-members__modal add`}
          onCancel={closeModal}
        >
          <AddPeopleForm
            activeOrg={user?.active_organization ?? 1}
            refetch={refetch}
            formType={modalType}
            onFinish={closeModal}
            setAddMethod={setModalType}
            projectID={projectID}
          />
        </Modal>
      </Suspense>
    </div>
  );
};

export default Members;
