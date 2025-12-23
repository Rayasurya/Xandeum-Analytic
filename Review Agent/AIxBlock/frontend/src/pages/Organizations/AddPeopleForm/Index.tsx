import React, { useCallback, useMemo, useState } from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Upload from "@/components/Upload/Upload";
import { ROLE_MEMBER } from "@/constants/projectConstants";
import { useInviteMember } from "@/hooks/organization/useInviteMember";
import "./Index.scss";
import { TUploadCSVParams } from "../../Project/Settings/Members/Members";
import { infoDialog } from "@/components/Dialog";
import { createAlert, createAlertSuccess } from "@/utils/createAlert";
import AddForm from "../AddForm/Index";
import InviteMemberDialog from "../InvitePeopleForm/Index";
import { TDataMember } from "../../Admin/Organization/Form/Index";

type TAddPeopleFormProps = {
  activeOrg: number;
  formType: string;
  refetch: () => Promise<void>;
  onFinish: () => void;
  setAddMethod: (val: string) => void;
  data?: TDataMember;
  projectID?: number;
};

const AddPeopleForm = (props: TAddPeopleFormProps) => {
  const { activeOrg, formType, refetch, onFinish, setAddMethod, data: dataMember, projectID} = props;
  const { error, inviteMember, inviteByEmail, validationErrors } =
    useInviteMember();
  const initialFormData: TUploadCSVParams = {
    csv_file: null,
    username: null,
    email: dataMember?.email ?? null,
    role: dataMember?.role ?? ROLE_MEMBER[0].options[0].value,
    organizationId: activeOrg.toString(),
  };
  const isUploadCsv = formType === "add-bulk";
  const [data, setData] = useState<TUploadCSVParams>(initialFormData);
  const [success, setSuccess] = useState("");

  const onChange = useCallback(
    (field: string, val: File | string) => {
      const updated = {
        ...data,
        [field]: val,
      };

      updated && setData(updated);
    },
    [data]
  );

  const onSubmitAddMember = useCallback(() => {
    const formData = new FormData();
    data.project_id = projectID?.toString()

    if (isUploadCsv) {
      if (data.csv_file === null) {
        infoDialog({message: "Please select a .csv file to continue."});
        return;
      } else {
        formData.append("csv_file", data.csv_file)
        formData.append("project_id", data.project_id || "")
      }
    } else {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      formData.delete("csv_file");
    }

    inviteMember(formData)
      .then(async (data) => {
        refetch().catch();
        onFinish?.();

        if (data && typeof data === "object" && Object.hasOwn(data, "password")) {
          infoDialog({
            // @ts-ignore
            message: <div>Password for the new user is <strong><code>{data["password"]}</code></strong></div>,
          });
        } else if (data && typeof data === "object" && Object.hasOwn(data, "detail")) {
          // @ts-ignore
          infoDialog({message: data["detail"]});
        } else {
          infoDialog({message: "File processed successfully"});
        }
      })
      .catch(msg => {
        if (msg && msg.length > 0) {
          infoDialog({title: "Error", message: msg});
        }
      });
  }, [data, inviteMember, isUploadCsv, refetch, onFinish, projectID])

  const onInviteMemberByEmail = useCallback(() => {
    if ((data?.email ?? "").trim().length === 0 || data?.email === null) {
      return false;
    }

    const ar = inviteByEmail((data?.email as string), activeOrg, data?.role ?? "", projectID);

    ar.promise
      .then(async r => {
      const data = await r.json();

      if (r.ok) {
        data["detail"] && setSuccess(data["detail"]);
        refetch().catch();
        onFinish?.();
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
  }, [activeOrg, data.email, data.role, inviteByEmail, onFinish, refetch, setAddMethod, projectID]);

  const clearFile = () => {
    setData((prevData) => ({
      ...prevData,
      csv_file: null,
    }));
  };

  const errorNode = React.useMemo(() => {
    return createAlert(error, undefined, false, {marginBottom: 32});
  }, [error]);

  const successNode = React.useMemo(() => {
    return createAlertSuccess(success, true);
  }, [success]);

  const renderForm = useMemo(() => {
    switch (formType) {
      case "add-people":
        return (
          <AddForm
            onSubmit={onSubmitAddMember}
            onChange={onChange}
            validationErrors={validationErrors}
            data={data}
          />
        );
      case "invite":
        return (
          <InviteMemberDialog
            onSubmit={onInviteMemberByEmail}
            onChange={onChange}
            validationErrors={validationErrors}
            onFinish={onFinish}
          />
        );
      default:
        break;
    }
  }, [
    formType,
    validationErrors,
    data,
    onChange,
    onInviteMemberByEmail,
    onSubmitAddMember,
    onFinish
  ]);

  return (
    <div className="c-add-user">
      {successNode}
      {errorNode}
      <form>
        {isUploadCsv ? (
          <>
            <div className="c-add-user__upload">
              <Upload
                accept=".csv"
                onUpload={(data) => onChange("csv_file", data as File)}
                name="csv_file"
                clearFile={clearFile}
              />
            </div>
            <div className="c-add-user__link-download">
              If you don't have csv fomat file,
              <a download href={require("@/constants/add_org_member.csv")} >Download</a>
            </div>
            <div className="c-add-user__action">
              <Button
                size="small"
                className="c-add-user__action--invite"
                icon={<IconPlus />}
                isBlock={true}
                disabled={isUploadCsv && !data["csv_file"]}
                onClick={onSubmitAddMember}
              >
                Upload selected file
              </Button>
            </div>
          </>
        ) : (
          <>{renderForm}</>
        )}
      </form>
    </div>
  );
};

export default AddPeopleForm;
