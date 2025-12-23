import React from "react";
import {LIST_TABS} from "../Tabs";
import ToolbarLayout from "../Shared/ToolbarLayout";

export type TProps = {
  rightContent?: React.ReactNode;
}

export default function ListingsLayout({children, rightContent}: React.PropsWithChildren<TProps>) {
  const tabs = React.useMemo(() => LIST_TABS.find(t => t.urlKey === "compute-listings"), []);

  return (
    <ToolbarLayout
      buttons={tabs?.children}
      urlPrefix="/infrastructure/compute-listings/"
      rightContent={rightContent}
    >
      {children}
    </ToolbarLayout>
  );
}
