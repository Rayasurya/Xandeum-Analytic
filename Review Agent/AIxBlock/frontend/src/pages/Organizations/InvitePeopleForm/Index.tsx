import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { ROLE_MEMBER } from "@/constants/projectConstants";

interface IInviteMemberDialogProps {
  onChange: (field: string, val: File | string) => void;
  validationErrors: { [k: string]: string[] };
  onSubmit: () => void;
  onFinish: () => void;
}

const InviteMemberDialog = (props: IInviteMemberDialogProps) => {
  const { onChange, onSubmit, onFinish, validationErrors } = props;

  return (
    <>
      <InputBase
        autoFocus={true}
        label="Email"
        onChange={(e) => onChange("email", e.target.value)}
        isDefaultValue={true}
        error={
          Object.hasOwn(validationErrors, "email")
            ? validationErrors.email[0]
            : null
        }
      />
      <Select
        className="c-add-user__select-role"
        label="Role"
        data={ROLE_MEMBER}
        onChange={(val) => onChange("role", val.value)}
        defaultValue={ROLE_MEMBER[0].options[0]}
        error={
          Object.hasOwn(validationErrors, "role")
            ? validationErrors.role[0]
            : null
        }
      />
      <div className="c-add-user__action invite">
        <Button
          size="small"
          className="c-add-user__action--cancel"
          onClick={onFinish}
        >
          Cancel
        </Button>
        <Button
          size="small"
          className="c-add-user__action--invite"
          icon={<IconPlus />}
          onClick={onSubmit}
        >
          Invite
        </Button>
      </div>
    </>
  );
};

export default InviteMemberDialog;
