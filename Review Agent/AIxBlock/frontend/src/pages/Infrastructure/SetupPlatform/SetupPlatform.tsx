import AddHost from "../Shared/AddHost";
import {useUserLayout} from "@/layouts/UserLayout";
import React from "react";

export default function SetupPlatform() {
  const {setCloseCallback, clearCloseCallback} = useUserLayout();

  React.useEffect(() => {
    setCloseCallback("/infrastructure/platform");
    return () => clearCloseCallback();
  }, [clearCloseCallback, setCloseCallback]);

  return (
    <div>
      <AddHost computeType={"label-tool"} />
    </div>
  );
}
