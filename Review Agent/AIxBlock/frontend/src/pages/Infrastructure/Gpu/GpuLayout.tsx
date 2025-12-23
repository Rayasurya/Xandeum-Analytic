import React from "react";
import {LIST_TABS} from "../Tabs";
import ToolbarLayout from "../Shared/ToolbarLayout";

export type TProps = {
  rightContent?: React.ReactNode;
}

export default function GpuLayout({children, rightContent}: React.PropsWithChildren<TProps>) {
  const tabs = React.useMemo(() => LIST_TABS.find(t => t.urlKey === "gpu"), []);

  return (
    <ToolbarLayout
      buttons={tabs?.children}
      urlPrefix="/infrastructure/gpu/"
      rightContent={rightContent}
    >
      {children}
    </ToolbarLayout>
  );
}
