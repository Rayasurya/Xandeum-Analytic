import React from "react";
import {Outlet} from "react-router-dom";
import {useUserLayout} from "@/layouts/UserLayout";
import Tabs from "./Tabs";
import InfrastructureProvider, {useInfrastructureProvider} from "./InfrastructureProvider";
import {createAlert} from "@/utils/createAlert";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import styles from "./Infrastructure.module.scss";

function Content() {
  const {rentedGpu: {error, refresh, loading}} = useInfrastructureProvider();
  useBooleanLoader(loading, "Fetching data...");

  const errorNode = React.useMemo(() => {
    if (!error || error.length === 0) {
      return null;
    }

    return (
      <div className={styles.error}>
        {createAlert(error, () => refresh())}
      </div>
    );
  }, [error, refresh]);

  return (
    <>
      {errorNode}
      {!errorNode && <Outlet />}
    </>
  );
}

export default function Infrastructure() {
  const {setBreadcrumbs, clearBreadcrumbs} = useUserLayout();

  React.useEffect(() => {
    setBreadcrumbs([{label: "Your Infrastructure List"}]);
    return () => clearBreadcrumbs();
  }, [clearBreadcrumbs, setBreadcrumbs]);

  return (
    <InfrastructureProvider>
      <Tabs />
      <Content />
    </InfrastructureProvider>
  );
}
