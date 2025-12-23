import React from "react";
import {LIST_TABS} from "../Tabs";
import ToolbarLayout from "../Shared/ToolbarLayout";

export type TProps = {
  rightContent?: React.ReactNode;
}

export default function StorageLayout({children, rightContent}: React.PropsWithChildren<TProps>) {
  const tabs = React.useMemo(() => LIST_TABS.find(t => t.urlKey === "storage"), []);

  return (
    <ToolbarLayout
      buttons={tabs?.children}
      urlPrefix="/infrastructure/storage/"
      rightContent={rightContent}
    >
      {children}
    </ToolbarLayout>
  );
}
