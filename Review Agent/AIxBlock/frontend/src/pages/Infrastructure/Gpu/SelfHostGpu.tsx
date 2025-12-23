import {useInfrastructureProvider} from "../InfrastructureProvider";
import GpuLayout from "./GpuLayout";
import styles from "./Gpu.module.scss";
import ComputeList from "../Shared/ComputeList";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import {useNavigate} from "react-router-dom";
import React from "react";
import {IconPlus} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";

export default function SelfHostGpu() {
  const {autoProvisionNode, selfHostGpu, rentedGpu: {refresh}} = useInfrastructureProvider();
  const navigate = useNavigate();

  return (
    <GpuLayout rightContent={(
      <>
        {autoProvisionNode}
        <Button onClick={() => navigate("/infrastructure/setup-gpu/self-host")}>
          <IconPlus />
          Add GPUs/CPUs
        </Button>
      </>
    )}>
      {
        selfHostGpu.length > 0
          ? (
            <div className={styles.container}>
              <ComputeList list={selfHostGpu} refresh={refresh}/>
            </div>
          )
          : <EmptyContent message="(Empty list)" />
      }
    </GpuLayout>
  );
}
