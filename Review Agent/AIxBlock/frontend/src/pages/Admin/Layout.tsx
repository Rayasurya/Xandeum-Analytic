import React from "react";
import Sidebar from "./SideBar/SideBar";
import "./Layout.scss";
import Header from "@/components/Header/Header";

export type TLayoutProps = {
  title?: string,
  actions?: React.ReactNode,
}

export default function AdminLayout({children, title, actions}: React.PropsWithChildren<TLayoutProps>) {
  return (
    <div className="c-admin-layout">
      <Sidebar />
      <div className="c-admin-layout__content">
        <Header title={title} actions={actions} />
        {children}
      </div>
    </div>
  );
}
