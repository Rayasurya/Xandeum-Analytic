import React, { useCallback } from "react";
import { Label } from "../../../components/Label/Label";
import "./CreateLabel.styl";
import { confirm } from "../../../common/Modal/Modal";
import Input from "../../../common/Input/Input";
import { getRoot } from "mobx-state-tree";

export default function CreateLabel({ controlStore, isQuick = false, onChange = null }) {
  const rootStore = getRoot(controlStore);

  const onCreateClick = useCallback(() => {
    const randId = "_" + Math.random().toString().substring(2, 10);
    let newLabel = "";

    confirm({
      title: "New Label",
      children: (<>
        <Input
          autofocus={true}
          required={true}
          id={randId}
          label="Label"
          placeholder="Enter label here..."
          onChange={e => newLabel = e.target.value.trim()}
        />
      </>),
      onShow: () => document.getElementById(randId)?.focus(),
      okText: "Create",
      onOk: () => {
        controlStore.addLabel(newLabel);
      },
    });
  }, []);

  if (!rootStore.canCreateLabel) {
    return null;
  }

  if (isQuick) {
    return (
      <Input
        placeholder="Create or search label..."
        onChange={e => onChange?.(e.target.value)}
        onKeyUp={e => {
          if (e.key === "Enter") {
            const value = e.currentTarget.value.trim();

            if (value.length === 0) {
              return;
            }

            controlStore.addLabel(value);
            e.currentTarget.value = "";
            onChange?.("");
          }
        }}
        style={{
          width: "calc(100% - 8px)",
          height: "auto",
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          paddingLeft: 8,
          paddingRight: 8,
          marginBottom: 8,
        }}
      />
    );
  }

  return (
    <>
      <Label
        className="create-label"
        color="#5050FF"
        margins={true}
        onClick={onCreateClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
        ADD LABEL
      </Label>
    </>
  );
}