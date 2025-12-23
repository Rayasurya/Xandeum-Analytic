import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useApi } from "@/providers/ApiProvider";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const containerID = "page-workflows-container";

export type TWorkflowsContext = {
  loading: boolean;
  route: string;
  inject: (e: HTMLElement) => () => void;
  navigateToCallback: () => void;
  callbackUrl: string | undefined
}

const WorkflowsContext = createContext<TWorkflowsContext>({
  loading: false,
  route: "/flows",
  inject: () => () => void 0,
  navigateToCallback: () => void 0,
  callbackUrl: undefined
});

const hideContainer = (e: HTMLElement) => {
  e.style.position = "fixed";
  e.style.top = `-${window.innerHeight + 100000}px`;
  e.style.left = `-${window.innerWidth + 100000}px`;
  e.style.borderRadius = "";
  e.style.overflow = "hidden";
}

export default function WorkflowsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState("/flows");
  const [token, setToken] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const containerRef = useRef(document.createElement("DIV"));
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [callbackUrl, setCallbackUrl] = useState<string | undefined>();

  const injectRef = useRef<TWorkflowsContext["inject"]>(
    (e: HTMLElement) => {
      const interval = setInterval(() => {
        requestAnimationFrame(() => {
          const rect = e.getBoundingClientRect();
          const s = window.getComputedStyle(e);
          containerRef.current.style.width = rect.width + "px";
          containerRef.current.style.height = rect.height + "px";
          containerRef.current.style.position = "fixed";
          containerRef.current.style.top = rect.top + "px";
          containerRef.current.style.left = rect.left + "px";
          containerRef.current.style.zIndex = s.zIndex;
          containerRef.current.style.borderRadius = s.borderRadius;
        });
      }, 13);

      return () => {
        clearInterval(interval);
        hideContainer(containerRef.current);
      }
    }
  );

  const navigateToCallback = useCallback(() => {
    if (callbackUrl) {
      navigate(callbackUrl);
      setCallbackUrl(undefined);
    }
  }, [navigate, callbackUrl, setCallbackUrl])

  useEffect(() => {
    if (!pathname.startsWith("/workflows/")) {
      hideContainer(containerRef.current);
    }
  }, [pathname]);

  useEffect(() => {
    const ar = api.call("getWorkflowsToken");
    ar.promise
      .then(r => r.text())
      .then(r => setToken(r))
      .catch(e => toast.error(e.toString()));
  }, [api]);

  useEffect(() => {
    const handler = (ev: any) => {
      const evType = ev["data"]?.["type"];

      if (!evType) {
        return;
      }

      window.APP_SETTINGS.debug && console.log("Workflows: " + evType);

      if (evType === "CLIENT_INIT") {
        setLoading(true);
      } else if (evType === "CLIENT_CONFIGURATION_FINISHED") {
        setTimeout(() => {
          initializedRef.current = true;
        }, 1000);

        setLoading(false);
      } else if (evType === "CLIENT_ROUTE_CHANGED") {
        let path = ev["data"]?.["data"]?.["route"];

        if (path) {
          if (path === "/marketplace/models" || path === "/marketplace/computes") {
            let flowId = ev["data"]?.["data"]?.["flowId"];
            let url = `/workflows/flows/${flowId}`;
            setCallbackUrl(url)
            navigate(path)
          } 
          else {
            if (path.startsWith("/settings/pieces")) {
              path = "/blocks";
            }
            setRoute(path);
          }

        }
      }
    }

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    }
  }, [setCallbackUrl, navigate]);

  const init = useCallback(async (token: string) => {
    window.APP_SETTINGS.debug && console.log("Init workflows: " + token);
    document.getElementById(containerID)?.querySelector("iframe")?.remove();
    document.getElementById(containerID)?.remove();
    containerRef.current = document.createElement("DIV");
    containerRef.current.id = containerID;
    hideContainer(containerRef.current);
    document.body.append(containerRef.current);

    setLoading(true);
    initializedRef.current = false;

    await window.pwf.configure({
      prefix: "/",
      instanceUrl: window.APP_SETTINGS.workflowEndpoint,
      jwtToken: token,
      embedding: {
        containerId: containerID,
        builder: {
          disableNavigation: true,
          hideLogo: true,
          hideFlowName: false,
        },
        dashboard: {
          hideSidebar: true,
        },
        hideFolders: true,
        navigation: {
          handler: ({ route }: any) => {

          },
        },
        styling: {
          fontUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap",
          fontFamily: "Montserrat",
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const timeout = setTimeout(() => {
      init(token).catch(e => toast.error(e.toString()));
    }, 300);

    return () => {
      clearTimeout(timeout);
    }
  }, [init, token, user]);

  return (
    <WorkflowsContext.Provider value={{
      loading,
      route,
      inject: injectRef.current,
      callbackUrl,
      navigateToCallback
    }}>
      {children}
    </WorkflowsContext.Provider>
  )
}

export function useWorkflows() {
  return useContext(WorkflowsContext);
}
