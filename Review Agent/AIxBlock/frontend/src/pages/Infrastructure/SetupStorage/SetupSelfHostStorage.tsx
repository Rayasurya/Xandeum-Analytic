import AddHost from "../Shared/AddHost";
import {useUserLayout} from "@/layouts/UserLayout";
import React from "react";

export default function SetupSelfHostStorage() {
  const {setCloseCallback, clearCloseCallback} = useUserLayout();

  React.useEffect(() => {
    setCloseCallback("/infrastructure/storage/self-host");
    return () => clearCloseCallback();
  }, [clearCloseCallback, setCloseCallback]);

  return (
    <div>
      <AddHost computeType={"storage"} />
    </div>
  );
}
