import InputBase, {TInputBaseProps} from "../InputBase/InputBase";
import useUsers from "@/providers/UsersProvider";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {TUserCompactModel} from "@/models/user";
import {getDisplayName} from "@/utils/user";
import Modal from "../Modal/Modal";
import {randomString} from "@/utils/random";
import {Tooltip} from "react-tooltip";
import Table from "../Table/Table";
import useUsersHook from "@/hooks/admin/user/useUsersHook";
import Button from "../Button/Button";

export type TProps = {
  label?: TInputBaseProps["label"],
  value?: number,
  onChange?: (v: number) => void,
  disabled?: boolean,
  required?: boolean,
  error?: string | null,
}

export default function UserSelect({label, value, onChange, disabled, required, error}: TProps) {
  const {getUser, users} = useUsers();
  const [user, setUser] = React.useState<TUserCompactModel | null>(value ? getUser(value).user : null);
  const [isSelecting, setIsSelecting] = useState(false);
  const fieldId = useMemo(() => "tooltip-" + randomString(6), []);
  const {list, search, setSearch, loading} = useUsersHook({pageSize: 5});
  const [newSearch, setNewSearch] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (value) {
      setUser(getUser(value).user);
    }
  }, [getUser, value, users])


  const displayName = React.useMemo(() => {
    if (!value) {
      return "";
    }

    if (!user) {
      return "#" + value;
    }

    return getDisplayName(user);
  }, [value, user]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setSearch(newSearch);
    }, 500);
  }, [newSearch, setSearch]);

  return (
    <>
      <InputBase
        label={label}
        readonly={true}
        value={displayName}
        allowClear={false}
        style={{cursor: "pointer"}}
        disabled={disabled}
        isRequired={required}
        error={error}
        onClick={() => setIsSelecting(true)}
        fieldName={fieldId}
        isControlledValue={true}
      />
      <Tooltip place="top" positionStrategy="fixed" content="Click to select user" anchorSelect={`#${fieldId}`}/>
      <Modal
        open={isSelecting}
        title="Select User"
        onClose={() => setIsSelecting(false)}
        onCancel={() => setIsSelecting(false)}
      >
        <div style={{
          marginTop: -16,
          marginBottom: 16,
        }}>
          <InputBase
            placeholder="Search user"
            value={search}
            isControlledValue={false}
            onChange={v => setNewSearch(v.currentTarget.value)}
          />
        </div>
        <Table
          columns={[
            {label: "#", dataKey: "id"},
            {label: "Username", dataKey: "username"},
            {label: "First Name", dataKey: "first_name"},
            {label: "Last Name", dataKey: "last_name"},
            {
              renderer: r => r.id
                ? (
                  <Button
                    size="tiny"
                    onClick={() => {
                      onChange?.(r.id);
                      setIsSelecting(false);
                    }}
                  >
                    Select
                  </Button>
                )
                : null,
            },
          ]}
          data={
            loading
              ? [{username: "Searching..."}]
              : search.trim() === ""
                ? [{username: "Enter keyword to search"}]
                : list}
        />
      </Modal>
    </>
  )
}
