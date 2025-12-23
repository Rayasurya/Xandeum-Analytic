import {Outlet, useLocation, useNavigate} from "react-router-dom";
import styles from "./PricingV2.module.scss";
import React from "react";
import {useUserLayout} from "@/layouts/UserLayout";

const TABS = [
  {label: "Platform Pricing", link: "platform"},
  {label: "Compute Pricing", link: "compute"},
  {label: "Model Marketplace", link: "model"},
  {label: "Crowdsourcing for AI", link: "crowdsourcing"},
]

export default function PricingV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParts = React.useMemo(() => location.pathname.split("/"), [location.pathname]);
  const {setBreadcrumbs, clearBreadcrumbs} = useUserLayout();

  React.useEffect(() => {
    setBreadcrumbs([
      {label: "Pricing"},
    ]);

    return () => clearBreadcrumbs();
  }, [clearBreadcrumbs, setBreadcrumbs]);

  return (
    <div className={styles.page}>
      <div className={styles.title}>Pricing Plans</div>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <span
              className={[styles.tab, t.link === urlParts[2] ? styles.tabActive : ""].join(" ")}
              onClick={() => navigate("/pricing/" + t.link)}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <Outlet/>
      </div>
    </div>
  );
}
