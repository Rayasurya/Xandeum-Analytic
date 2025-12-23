import AddHost from "../Shared/AddHost";
import {useUserLayout} from "@/layouts/UserLayout";
import React from "react";

export default function SetupSelfHostGpu() {
  const {setCloseCallback, clearCloseCallback} = useUserLayout();

  React.useEffect(() => {
    setCloseCallback("/infrastructure/gpu/self-host");
    return () => clearCloseCallback();
  }, [clearCloseCallback, setCloseCallback]);

  return (
    <div>
      <AddHost computeType={"model-training"} />
    </div>
  );
}
