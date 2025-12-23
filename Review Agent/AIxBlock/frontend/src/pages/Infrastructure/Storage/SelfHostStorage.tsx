import {useInfrastructureProvider} from "../InfrastructureProvider";
import styles from "./SelfHostStorage.module.scss";
import ComputeList from "../Shared/ComputeList";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import StorageLayout from "./StorageLayout";
import {useNavigate} from "react-router-dom";
import React from "react";
import {IconPlus} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";

export default function SelfHostStorage() {
  const {rentedGpu: {refresh}, selfHostStorage} = useInfrastructureProvider();
  const navigate = useNavigate();

  return (
    <StorageLayout rightContent={(
      <Button onClick={() => navigate("/infrastructure/setup-storage/self-host")}>
        <IconPlus />
        Add compute
      </Button>
    )}>
      {
        selfHostStorage.length > 0
          ? (
            <div className={styles.container}>
              <ComputeList list={selfHostStorage} refresh={refresh}/>
            </div>
          )
          : <EmptyContent message="(Empty list)" />
      }
    </StorageLayout>
  );
}
