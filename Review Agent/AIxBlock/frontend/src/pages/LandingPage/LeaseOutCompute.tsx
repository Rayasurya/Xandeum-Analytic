import React from "react";
import LandingPage from "./LandingPage";
import {useNavigate} from "react-router-dom";
import {useUserLayout} from "@/layouts/UserLayout";

export type TProps = {
  contentOnly?: boolean,
}

export default function LeaseOutCompute({contentOnly}: TProps) {
  const navigate = useNavigate();
  const {setCloseCallback, clearCloseCallback, setBreadcrumbs, clearBreadcrumbs} = useUserLayout();

  React.useEffect(() => {
    if (contentOnly) {
      return;
    }

    setCloseCallback("/dashboard/");
    setBreadcrumbs([{ label: "Lease Out Compute" }]);

    return () => {
      clearCloseCallback();
      clearBreadcrumbs();
    }
  }, [contentOnly, clearBreadcrumbs, clearCloseCallback, setBreadcrumbs, setCloseCallback]);

  return (
    <LandingPage
      noAutoMargin={contentOnly}
      style={contentOnly ? {paddingTop: 72, paddingBottom: 72} : {}}
      icon={<img src={require("@/assets/images/gpu.png")} alt="Lease out compute" />}
      heading="Lease Out Your Unused Compute"
      intro="Don't let your compute power go to waste—lease it out and start earning money quickly. Turn idle compute into a useful resource by connecting with people who need it"
      actions={[
        {
          children: "Setup Your Compute Now",
          onClick: () => navigate("/infrastructure/list-compute"),
          icon: (
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.68262 12.9401L6.57262 8.05006C7.15012 7.47256 7.15012 6.52756 6.57262 5.95006L1.68262 1.06006"
                    stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"
                    strokeLinejoin="round"/>
            </svg>
          ),
        },
      ]}
    />
  );
}
