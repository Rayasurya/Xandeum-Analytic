import React, {Fragment, memo, useCallback, useEffect, useMemo, useState} from "react";
import IconClear from "@/assets/icons/IconClear";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import {TAdminOrganizationDTO, useAdminOrganizations} from "@/hooks/organization/useAdminOrganizations";
import {TOrganizationMember, useGetListMembers} from "@/hooks/settings/members/useGetListMembers";
import {useBooleanLoader, usePromiseLoader} from "@/providers/LoaderProvider";
import {createAlert, createAlertSuccess} from "@/utils/createAlert";
import {confirmDialog, infoDialog} from "@/components/Dialog";
import {useInviteMember} from "@/hooks/organization/useInviteMember";
import AddPeopleForm from "../../../Organizations/AddPeopleForm/Index";
import Modal from "@/components/Modal/Modal";
import {userRoles} from "@/utils/user";
import { ROLE_MEMBER } from "@/constants/projectConstants";

type TAddOrgFormProps = {
  data: TAdminOrganizationDTO;
  active_org?: number;
  refetch: () => Promise<void>;
  onClose: () => void;
  currentUserId?: number;
};

const STATUS = [
  {
    label: "",
    options: [
      { label: "Active", value: "actived" },
      { label: "Pending", value: "pending" },
      { label: "Suppend", value: "suppend" },
    ],
  },
];

export type TDataMember = {
  email: string;
  role: string;
}

const MemoizedAddOrgForm = (props: TAddOrgFormProps) => {
  const { data, refetch, onClose, currentUserId } = props;
  const [organization, setOrganization] = useState<TAdminOrganizationDTO>(data);
  const isUpdate = organization.id > 0;
  const {dataMembers, fetchData: refreshMembersList} = useGetListMembers(isUpdate && data ? data.id : null);
  const {save, error, loading, validationErrors, removeMember} = useAdminOrganizations();
  const {inviteByEmail} = useInviteMember();
  const {addPromise} = usePromiseLoader();
  const [success, setSuccess] = useState("");
  const [addMethod, setAddMethod] = useState<string | null>(null);
  useBooleanLoader(loading, "Saving organization...");
  const [dataMember, setDataMember] = useState<TDataMember>({email: "", role: ROLE_MEMBER[0].options[0].value});

  const onChangeField = (field: string, val: string) => {
    const update: any = {...organization, [field]: val};
    update && setOrganization(update);
  };

  const currentStatus = useMemo(() => {
    return (
      STATUS[0].options.find((item) => item.value === organization?.status) ?? null
    );
  }, [organization]);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      await save({
        ...organization,
        status: organization.status ?? "actived",
        token: organization?.token ?? Math.random().toString().substring(2, 6),
        team_id: organization?.team_id ?? Math.random().toString().substring(2, 6),
      });

      refetch().catch();
      onClose();
    },
    [organization, onClose, save, refetch]
  );

  const remove = useCallback((member: TOrganizationMember) => {
    confirmDialog({
      title: "Remove member",
      message: "Are you sure you want to remove this member from organization?",
      onSubmit: () => {
        const ar = removeMember(data?.id ?? 0, member.user.id);
        addPromise(ar.promise, "Removing member...");
        ar.promise.then(() => refreshMembersList());
      },
    })
  }, [data?.id, refreshMembersList, removeMember, addPromise]);

  const addMemberByEmail = useCallback(() => {
    confirmDialog({
      title: "Add member",
      className: "admin-add-user-form",
      message: <div className="c-add-user admin">
        <InputBase
          autoFocus={true}
          label="Email"
          onChange={e => setDataMember(c => ({...c, email: e.target.value}))}
        />
        <Select
          className="c-add-user__select-role"
          label="Role"
          data={ROLE_MEMBER}
          onChange={val => setDataMember(c => ({...c, role: val.value}))}
          defaultValue={ROLE_MEMBER[0].options[0]}
          error={
            Object.hasOwn(validationErrors, "role")
              ? validationErrors.role[0]
              : null
          }
        />
      </div>,
      onSubmit: () => {
        if (dataMember.email.trim().length === 0) {
          return false;
        }

        const ar = inviteByEmail(dataMember.email, organization.id, dataMember.role);

        ar.promise
          .then(async r => {
            const data = await r.json();

            if (r.ok) {
              data["detail"] && setSuccess(data["detail"]);
              refreshMembersList();
              return true;
            }

            let errorMsg = r.statusText;

            if (data["missing"] === true) {
              setAddMethod("add-people");
              return true;
            } else if (Object.hasOwn(data, "detail")) {
              errorMsg = data["detail"];
            }

            infoDialog({title: "Error", message: errorMsg});
            return false;
          });
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteByEmail, refreshMembersList, organization.id]);

  const errorNode = React.useMemo(() => {
    return createAlert(error, undefined, false);
  }, [error]);

  const successNode = React.useMemo(() => {
    return createAlertSuccess(success, true);
  }, [success]);

  useEffect(() => {
    setOrganization(data);
  }, [data]);

  return (
    <Fragment>
      <div className="c-org-form">
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="c-org-form__content">
            {successNode}
            {errorNode}
            <div className="c-org-form__top">
              <InputBase
                className="c-org-form__input"
                label="Organization name"
                placeholder="Type name project"
                value={organization?.title ? organization?.title : ""}
                allowClear={false}
                onChange={(e) => onChangeField("title", e.target.value)}
                error={Object.hasOwn(validationErrors, "title") ? validationErrors["title"][0] : null}
                isRequired
              />
              <Select
                className="c-org-form__select"
                label="Status"
                data={STATUS}
                onChange={(val) => onChangeField("status", val.value)}
                defaultValue={currentStatus ? currentStatus : STATUS[0].options[0]}
                error={Object.hasOwn(validationErrors, "status") ? validationErrors["status"][0] : null}
              />
            </div>
            {isUpdate && <div className="c-org-form__bottom">
              <h4>Members</h4>
              {dataMembers?.results?.length === 0 && <div><em>(No members found)</em></div>}
              {dataMembers?.results?.map((member) => (
                <div
                  className="c-org-form__member-item"
                  key={`key-${member?.id}`}
                >
                  <div className="c-org-form__member-value">
                    {member.user.email}
                    {member.user.id === currentUserId ? <em>(you)</em> : null}
                  </div>
                  <div className="c-org-form__member-roles">
                    {userRoles(member.user).join(", ")}
                  </div>
                  <button type="button" className="c-org-form__member--clear" onClick={() => remove(member)} disabled={member.user.id === currentUserId}>
                    <IconClear />
                  </button>
                </div>
              ))}
            </div>}
          </div>
          <div className="c-org-form__action">
            {isUpdate && <Fragment>
              <Button
                type="secondary"
                icon={<IconPlus />}
                size="small"
                onClick={() => setAddMethod("add-bulk")}
              >
                CSV
              </Button>
              <Button
                type="secondary"
                icon={<IconPlus />}
                size="small"
                onClick={() => addMemberByEmail()}
              >
                Member
              </Button>
            </Fragment>}
            <Button
              htmlType="submit"
              className="c-org-form__action--add"
              icon={<IconPlus />}
            >
              {isUpdate ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
      <Modal
        open={!!addMethod}
        title="New member"
        closeOnOverlayClick={true}
        onCancel={() => setAddMethod(null)}
      >
        <AddPeopleForm
          activeOrg={organization.id}
          formType={addMethod ?? "add-people"}
          refetch={refreshMembersList}
          onFinish={() => {
            setAddMethod(null);
            setSuccess("New member has been added successfully");
          }}
          setAddMethod={setAddMethod}
          data={dataMember}
        />
      </Modal>
    </Fragment>
  );
};

const AddOrgForm = memo(MemoizedAddOrgForm);

export default AddOrgForm;
