import React from "react";
import { useUserLayout } from "@/layouts/UserLayout";
import "./Index.scss";
// import InputBase from "@/components/InputBase/InputBase";


const DocumentPage = () => {
  const userLayout = useUserLayout();

  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Document" }]);
    return () => {
      userLayout.clearBreadcrumbs();
    }
  }, [userLayout]);

  return (
    <iframe
      title="document"
      className="page-coda"
      src="https://coda.io/embed/va0R5Pzc-3/_suYK3?viewMode=embedplay" 
    />
  );
};

export default DocumentPage;
