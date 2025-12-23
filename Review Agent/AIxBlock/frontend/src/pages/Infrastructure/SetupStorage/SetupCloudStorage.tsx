import StorageList from "../Shared/StorageList";
import {useUserLayout} from "@/layouts/UserLayout";
import React from "react";
import styles from "./SetupCloudStorage.module.scss";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";

export default function SetupCloudStorage() {
  const {setCloseCallback, clearCloseCallback} = useUserLayout();
  const triggerAdd = React.useRef<Function>();

  React.useEffect(() => {
    setCloseCallback("/infrastructure/storage/cloud");
    return () => clearCloseCallback();
  }, [clearCloseCallback, setCloseCallback]);

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <Button
          type="secondary"
          size="small"
          onClick={() => triggerAdd.current?.()}
        >
          <IconPlus/>
          Cloud Storage
        </Button>
      </div>
      <StorageList setTriggerAdd={f => triggerAdd.current = f} />
    </div>
  );
}
