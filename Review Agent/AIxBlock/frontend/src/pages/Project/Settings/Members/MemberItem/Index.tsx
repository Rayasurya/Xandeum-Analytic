import React, { memo } from "react";
import IconClearCircle from "@/assets/icons/IconClearCircle";
import { TOrganizationUser } from "@/hooks/settings/members/useGetListMembers";
import { userRoles } from "@/utils/user";
import { TUserModel } from "@/models/user";

type TMemberItem = {
  data: TOrganizationUser;
  orgId: number;
  isYou: boolean;
  user: TUserModel | null;
  onEditMember?: (val: TOrganizationUser) => void;
  onRemove?: (id: number, orgId: number) => void;
};

const MemoizedMemberItem = (props: TMemberItem) => {
  const { data, orgId, isYou, onRemove} = props;

  const roles = [];

  if (data.is_qa) {
    roles.push("QA");
  }

  if (data.is_qc) {
    roles.push("QC");
  }

  if (roles.length === 0) {
    roles.push("Annotator");
  }

  // const handleSubmitEdit = () => {
  //   setIsEditing(false);
  // }

  return (
    <div className="c-members__list-item">
      <div className="c-members__item-value">{data.email}</div>
      <div className="c-members__item-value">{userRoles(data).join(", ")}</div>
      <div className="c-members__item-value actions">
        {/* <button
          className="c-members__item--clear"
          onClick={() => {
            isEditing ? handleSubmitEdit() : setIsEditing(true);
          }}
          {...(isYou || data.is_superuser || !editable) && { disabled: true, style: { opacity: .5 } }}
        // disabled
        >
          {isEditing ? <IconSaveDisk width={18} height={18} /> : <IconEdit width={18} height={18} />}
        </button> */}
        {isYou ? (
          <span className="you">You</span>
        ) : (
          <button
            className="c-members__item--clear"
            onClick={() => onRemove?.(data.id, orgId)}
          >
            <IconClearCircle width={18} height={18} />
          </button>
        )}
      </div>
    </div>
  );
};

const MemberItem = memo(MemoizedMemberItem);

export default MemberItem;
