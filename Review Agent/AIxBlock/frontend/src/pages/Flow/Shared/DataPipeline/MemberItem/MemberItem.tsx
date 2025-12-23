import React, {useCallback, useMemo} from "react";
import IconClearCircle from "@/assets/icons/IconClearCircle";
import { TOrganizationUser } from "@/hooks/settings/members/useGetListMembers";
import {listUserRoles, userRoles} from "@/utils/user";
import { TUserModel } from "@/models/user";
import styles from "./MemberItem.module.scss";
import Select, {SelectOption} from "@/components/Select/Select";
import IconSaveDisk from "@/assets/icons/IconSaveDisk";
import {IconEdit} from "@/assets/icons/Index";
import {getRoleKey, ROLES_MAP} from "../../../../Project/Settings/Members/utils";

type TMemberItem = {
  data: TOrganizationUser;
  orgId: number;
  isYou: boolean;
  user: TUserModel | null;
  onEditMember?: (val: TOrganizationUser) => Promise<void>;
  onRemove?: (id: number, orgId: number) => void;
};

export default function MemberItem(props: TMemberItem) {
  const {data, orgId, isYou, onRemove, onEditMember, user} = props;
  const [isEditing, setIsEditing] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<SelectOption>({label: "", value: ""});

  const editable = useMemo(() => {
    if (!user) {
      return false;
    }

    return !data.is_organization_admin && !data.is_superuser && data.id !== user.id;
  }, [data.id, data.is_organization_admin, data.is_superuser, user]);

  const currentRole = useMemo(() => getRoleKey(data), [data]);

  const handleSubmitEdit = useCallback(() => {
    setIsProcessing(true);
    onEditMember?.({
      ...data,
      is_qa: false,
      is_qc: false,
      [selectedRole.value]: true,
    })
      .finally(() => {
        setIsProcessing(false);
        setIsEditing(false);
      });
  }, [data, onEditMember, selectedRole]);

  const startEdit = useCallback(() => {
    setSelectedRole({
      label: ROLES_MAP[currentRole],
      value: currentRole,
    });

    setIsEditing(true);
  }, [currentRole]);

  return (
    <div className={styles.item}>
      <div className={styles.value}>{data.email}</div>
      <div className={styles.value}>
        {
          isProcessing
            ? "Saving..."
            : (isEditing
              ? (
                <Select
                  isSelectGroup={false}
                  data={[{
                    label: "",
                    options: listUserRoles.filter((item) => {
                      return item.value !== "is_superuser" && item.value !== "is_organization_admin";
                    })
                  }]}
                  onChange={(data) => {
                    setSelectedRole(data);
                  }}
                  defaultValue={selectedRole}
                />
              )
              : userRoles(data).join(", "))
        }
      </div>
      <div className={[styles.value, styles.actions].join(" ")}>
        {isYou ? (
          <span className={styles.you}>You</span>
        ) : (
          <>
            {editable && (
              <button
                className={styles.remove}
                onClick={() => {
                  isEditing ? handleSubmitEdit() : startEdit();
                }}
              >
                {isEditing ? <IconSaveDisk width={18} height={18} /> : <IconEdit width={18} height={18} />}
              </button>
            )}
            <button
              className={styles.remove}
              onClick={() => onRemove?.(data.id, orgId)}
            >
              <IconClearCircle width={18} height={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
