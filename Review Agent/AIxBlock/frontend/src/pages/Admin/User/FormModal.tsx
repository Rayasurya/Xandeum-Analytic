import {useCallback, useEffect, useState} from "react";
import Modal from "@/components/Modal/Modal";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";
import Switch from "@/components/Switch/Switch";
import { useCreateUser } from "@/hooks/admin/user/useCreateUser";
import { useGetMyOrganizations } from "@/hooks/organization/useGetMyOrganizations";
import "./FormModal.scss";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import { infoDialog } from "@/components/Dialog";
import {TUserModel} from "@/models/user";
import InputBase from "@/components/InputBase/InputBase";

type AddUserModalProps = {
  isOpenModal: boolean;
  data: TUserModel;
  setCloseModal: () => void;
  onSaved: () => void;
};

const FormModal = (props: AddUserModalProps) => {
  const { isOpenModal, data, setCloseModal, onSaved } = props;
  const [user, setUser] = useState<TUserModel>(data);
  const { create, validationErrors, loading: savingUser } = useCreateUser();
  const organizations = useGetMyOrganizations();
  useBooleanLoader(savingUser, "Saving user...");

  useEffect(() => {
    if (validationErrors.system) {
      infoDialog({message: validationErrors.system});
    }
  }, [validationErrors]);

  const handleChangeUser = ({key, value}: {
    key: keyof TUserModel;
    value: any;
  }) => {
    setUser({ ...user, [key]: value });
  };

  const organizationData: DataSelect[] = [
    {
      options: organizations.organizations.map((item) => ({
        label: item.title,
        value: String(item.id),
      })) as SelectOption[],
    },
  ];

  const findValueOrganization = organizationData[0].options.find(
    (item) => Number(item.value) === user.active_organization
  );

  const saveUser = useCallback(() => {
    const ar = create(user);

    if (!ar) {
      return;
    }

    ar.promise
      .then(r => {
        if (r.ok) {
          onSaved();
        }
      });
  }, [create, onSaved, user]);

  return (
    <Modal
      open={isOpenModal && !savingUser}
      title={user.id > 0 ? "Update user" : "Create user"}
      className="add-user-modal"
      onCancel={setCloseModal}
      submitText={user.id > 0 ? "Edit" : "Add"}
      onSubmit={() => saveUser()}
    >
      <div className="add-user-modal-form">
        <div className="add-user-modal-form__group w-half">
          <InputBase
            label="First name"
            value={user.first_name}
            onChange={(e) => handleChangeUser({ key: "first_name", value: e.target.value })}
            error={validationErrors.first_name?.[0] ?? null}
          />
        </div>
        <div className="add-user-modal-form__group w-half">
          <InputBase
            label="Last name"
            value={user.last_name}
            onChange={(e) => handleChangeUser({ key: "last_name", value: e.target.value })}
            error={validationErrors.last_name?.[0] ?? null}
          />
        </div>
        <div className="add-user-modal-form__group w-half">
          <InputBase
            label="Email"
            value={user.email}
            onChange={(e) => handleChangeUser({ key: "email", value: e.target.value })}
            error={validationErrors.email?.[0] ?? null}
            isRequired
          />
        </div>
        <div className="add-user-modal-form__group w-half">
          <InputBase
            label="Username"
            value={user.username}
            onChange={(e) => handleChangeUser({ key: "username", value: e.target.value })}
            error={validationErrors.username?.[0] ?? null}
            isRequired
          />
        </div>
        <div className="add-user-modal-form__group w-half">
          <InputBase
            label="Password"
            value={user.password}
            onChange={(e) => handleChangeUser({ key: "password", value: e.target.value })}
            error={validationErrors.password?.[0] ?? null}
            isRequired
          />
        </div>
        <div className="add-user-modal-form__group w-half">
          <Select
            label="Organization"
            data={organizationData}
            defaultValue={findValueOrganization}
            onChange={(data) =>
              handleChangeUser({
                key: "active_organization",
                value: Number(data.value),
              })
            }
            error={validationErrors.active_organization?.[0] ?? null}
          />
        </div>
        <div className="add-user-modal-form__group">
          <label className="c-account-setting__label permissions-label">
            Permissions
          </label>
          <div className="permissions-row">
            <Switch onChange={() => handleChangeUser({key: "is_active", value: !user.is_active})} checked={user.is_active} />
            <div className="permissions-row-content">
              <span>Active?</span>
              <span>
                Designates whether to treat this user as active. Unselect this instead of deleting accounts.
              </span>
            </div>
          </div>
          <div className="permissions-row">
            <Switch onChange={() => handleChangeUser({key: "is_superuser", value: !user.is_superuser})} checked={user.is_superuser} />
            <div className="permissions-row-content">
              <span>Super User</span>
              <span>
                Designates that this user has all permissions without explicitly assigning them.
              </span>
            </div>
          </div>
          <div className="permissions-row" >
            <Switch onChange={() => handleChangeUser({key: "is_qa", value: !user.is_qa})} checked={user.is_qa} />
            <div className="permissions-row-content">
              <span>QA</span>
              <span>
                Designates whether the user can review tasks.
              </span>
            </div>
          </div>
          <div className="permissions-row" onClick={() => handleChangeUser({key: "is_qc", value: !user.is_qc})}>
            <Switch checked={user.is_qc} />
            <div className="permissions-row-content">
              <span>QC</span>
              <span>
                Designates whether the user can qualify tasks.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FormModal;
