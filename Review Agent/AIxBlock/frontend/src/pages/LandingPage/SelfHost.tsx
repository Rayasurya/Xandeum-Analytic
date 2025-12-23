import React from "react";
import LandingPage from "./LandingPage";
import {useNavigate} from "react-router-dom";
import {useUserLayout} from "@/layouts/UserLayout";

export default function SelfHost() {
  const navigate = useNavigate();
  const {setCloseCallback, clearCloseCallback, setBreadcrumbs, clearBreadcrumbs} = useUserLayout();

  React.useEffect(() => {
    setCloseCallback("/dashboard/");
    setBreadcrumbs([{ label: "Self Host On Your Own Server" }]);

    return () => {
      clearCloseCallback();
      clearBreadcrumbs();
    }
  }, [clearBreadcrumbs, clearCloseCallback, setBreadcrumbs, setCloseCallback]);

  return (
    <LandingPage
      icon={<img src={require("@/assets/images/self-host.png")} alt="Self-host" />}
      heading="Self host on your own infrastructure"
      actions={[
        {
          children: "Get Started",
          onClick: () => navigate("/infrastructure/setup-platform"),
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
