import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import { useUserLayout } from "@/layouts/UserLayout";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import { useLocation, useNavigate } from "react-router-dom";
// import {TNavbarBreadcrumb} from "@/components/Navbar/Navbar";
import { useWorkflows } from "@/providers/WorkflowsProvider";

const getInitUrl = (pathname: string) => {
  if (
    pathname.startsWith("/workflows/flows")
    || pathname.startsWith("/workflows/runs")
    || pathname.startsWith("/workflows/connections")
    || pathname.startsWith("/workflows/mcp")
    || pathname.startsWith("/workflows/blocks")
    || pathname.startsWith("/workflows/ai-providers")
  ) {
    return pathname.substring(10);
  }

  return "/flows";
}

export default function Workflows() {
  const { setActions, clearActions, setBreadcrumbs, clearBreadcrumbs } = useUserLayout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initUrl = useRef(getInitUrl(pathname));
  const { loading, route, inject } = useWorkflows();
  const containerRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    // const actions: TNavbarBreadcrumb[] = [
    //   {
    //     label: "Flows",
    //     actionType: route.startsWith("/flows") ? "primary" : "outline",
    //     onClick: () => window.pwf.navigate({route: "/flows"}),
    //   },
    //   {
    //     label: "Runs",
    //     actionType: route.startsWith("/runs") ? "primary" : "outline",
    //     onClick: () => window.pwf.navigate({route: "/runs"}),
    //   },
    //   {
    //     label: "Connections",
    //     actionType: route.startsWith("/connections") ? "primary" : "outline",
    //     onClick: () => window.pwf.navigate({route: "/connections"}),
    //   },
    //   {
    //     label: "MCP",
    //     actionType: route.startsWith("/mcp") ? "primary" : "outline",
    //     onClick: () => window.pwf.navigate({route: "/mcp"}),
    //   },
    //   {
    //     label: "Pieces",
    //     actionType: route.startsWith("/settings/pieces") ? "primary" : "outline",
    //     onClick: () => window.pwf.navigate({route: "/settings/pieces"}),
    //   },
    // ];

    if (route.startsWith("/flows/")) {
      setActions([
        // ...actions,
        { label: "Close", actionType: "danger", onClick: () => window.pwf.navigate({ route: "/flows" }) },
      ])
    } else {
      // setActions(actions);
    }

    return () => {
      clearActions();
    }
  }, [clearActions, route, setActions, initialized]);

  useEffect(() => {
    let label: string = "";

    if (route.startsWith("/flows")) {
      label = "Flows";
    } else if (route.startsWith("/runs")) {
      label = "History";
    } else if (route.startsWith("/connections")) {
      label = "Applications";
    } else if (route.startsWith("/mcp")) {
      label = "MCP Configuration";
    } else if (route.startsWith("/ai-providers")) {
      label = "AI Integration";
    }

    if (label.trim().length > 0) {
      setBreadcrumbs([{label: "Automation Workflows"}, {label}]);
    } else {
      setBreadcrumbs([{label: "Automation Workflows"}]);
    }

    return () => {
      clearBreadcrumbs();
    }
  }, [route, setBreadcrumbs, clearBreadcrumbs]);

  useEffect(() => {
    if (initialized) {
      navigate("/workflows" + route);
      return;
    }

    const check = initUrl.current === route;

    if (check !== initialized) {
      setInitialized(check);
    }
  }, [initialized, navigate, route]);

  useEffect(() => {
    if (initialized) {
      return;
    }

    if (route !== initUrl.current) {
      if (initUrl.current.startsWith("/blocks")) {
        window.pwf.navigate({ route: "/settings/pieces" });
      }
      else {
        window.pwf.navigate({ route: initUrl.current });
      }
    }
  }, [initialized, route]);

  useLayoutEffect(() => {
    if (loading || !containerRef.current) {
      return;
    }

    return inject(containerRef.current);
  }, [inject, loading]);
  return (
    <div ref={containerRef} className={styles.container}>
      {!initialized && <EmptyContent message="Loading data..." />}
    </div>
  );
}
