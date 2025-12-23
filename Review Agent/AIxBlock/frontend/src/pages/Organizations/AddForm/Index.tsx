import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { ROLE_MEMBER } from "@/constants/projectConstants";
import { TUploadCSVParams } from "../../Project/Settings/Members/Members";

interface IAddFormProps {
  validationErrors: { [k: string]: string[] };
  onChange: (field: string, val: File | string) => void;
  onSubmit: () => void;
  data?: TUploadCSVParams;
}

const AddForm = (props: IAddFormProps) => {
  const { validationErrors, onChange, onSubmit, data } = props;
  return (
    <>
      <InputBase
        autoFocus={true}
        label="Username"
        placeholder="Type the username of new user"
        allowClear={false}
        onChange={(e) => onChange("username", e.target.value)}
        error={
          Object.hasOwn(validationErrors, "username")
            ? validationErrors.username[0]
            : null
        }
      />
      <InputBase
        label="Email"
        placeholder="Typing member email"
        allowClear={false}
        onChange={(e) => onChange("email", e.target.value)}
        value={data?.email ?? ""}
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
        defaultValue={{ label: data?.role === "qa" || data?.role === "qc" ? data?.role?.toLocaleUpperCase() : data?.role?.toUpperCaseFirst() ?? ""  , value: data?.role ?? "" } ?? ROLE_MEMBER[0].options[0]}
        error={
          Object.hasOwn(validationErrors, "role")
            ? validationErrors.role[0]
            : null
        }
      />
      <Button
        size="small"
        className="c-add-user__action--invite"
        icon={<IconPlus />}
        isBlock={true}
        onClick={onSubmit}
      >
        Invite Member
      </Button>
    </>
  );
};

export default AddForm;
