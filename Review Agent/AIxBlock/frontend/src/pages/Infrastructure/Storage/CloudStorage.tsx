import StorageLayout from "./StorageLayout";
import StorageList from "../Shared/StorageList";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import React from "react";
import styles from './CloudStorage.module.scss';

export default function CloudStorage() {
  const triggerAdd = React.useRef<Function>();

  return (
    <StorageLayout rightContent={(
      <Button
        type="secondary"
        size="small"
        className={styles.source}
        onClick={() => triggerAdd.current?.()}
      >
        <IconPlus/>
        Cloud Storage
      </Button>
    )}>
      <StorageList setTriggerAdd={f => triggerAdd.current = f} />
    </StorageLayout>
  );
}
