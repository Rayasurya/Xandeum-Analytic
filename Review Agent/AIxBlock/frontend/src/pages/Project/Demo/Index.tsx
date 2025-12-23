import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Alert from "@/components/Alert/Alert";
import useProjectHook from "@/hooks/project/useProjectHook";
import useMLBackendHook from "@/hooks/settings/ml/useMLBackendHook";
import { useUserLayout } from "@/layouts/UserLayout";
import { TProjectModel } from "@/models/project";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import { createAlert } from "@/utils/createAlert";

function DemoPreview({backendURL, projectID}: { backendURL: string, projectID: number }) {
  const [loading, setLoading] = React.useState(true);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const controller = new AbortController();

    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        project: projectID.toString(),
      }),
      signal: controller.signal,
    };

    let url = backendURL;

    while (url.endsWith("/")) {
      url = url.substring(0, url.length - 2);
    }

    fetch(backendURL + "/model", requestOptions)
      .then(r => r.json())
      .then(r => {
        if (controller.signal.aborted || !Object.hasOwn(r, "share_url")) {
          return;
        }
        setPreviewUrl(r.share_url);
      })
      .catch(e => {
        if (Object.hasOwn(e, "message")) {
          setError(e.message);
        } else {
          setError("An error has been occurred while loading model information.");
        }
      })
      .finally(() => {
        if (controller.signal.aborted) {
          return;
        }

        setLoading(false);
      });
  }, [backendURL, projectID]);

  if (loading) {
    return <>Loading model...</>;
  }

  if (error) {
    return <>{error}</>;
  }

  if (!previewUrl) {
    return <p className="no-results">No model URL found!</p>;
  }

  return (
    <iframe
      title="Model Demo"
      allow="camera;microphone"
      src={previewUrl}
      style={{width: "100%", height: "calc(100vh - 73px)", border: "none"}}
    />
  );
}

function DemoContent({ project }: { project: TProjectModel }) {
  const mlBackends = useMLBackendHook(project.id);
  useBooleanLoader(
    mlBackends.loading || !mlBackends.initialized,
    "Loading ML backends..."
  );

  const errorNode = React.useMemo(() => {
    if (mlBackends.loadingError) {
      return createAlert(mlBackends.loadingError, undefined, false, {
        marginBottom: 32,
      });
    }
  }, [mlBackends.loadingError]);

  if (mlBackends.list.length === 0) {
    return (
      <Alert
        message="Please add ML backends first."
        type="Warning"
        dismissable={true}
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <>
      {errorNode}
      <DemoPreview backendURL={mlBackends.list[0].url} projectID={project.id} />
    </>
  );
}

export default function Demo() {
  const params = useParams();
  const projectID = parseInt(params.projectID ?? "0");
  const project = useProjectHook(projectID);
  const userLayout = useUserLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const fallBackPage = location.state?.currentPage ?? 1;
  const [fallBack] = React.useState(fallBackPage);

  useBooleanLoader(
    !project.initialized,
    "Loading project information..."
  );

  React.useEffect(() => {
    if (!project.detail) {
      return;
    }

    userLayout.setBreadcrumbs([
      {label: "Projects", onClick: () => navigate(`/projects?page=${fallBack}`)},
      {label: project.detail.title, onClick: () => navigate("/projects/" + project.detail?.id + "/data")},
      {label: "Demo"},
    ]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [fallBack, navigate, project.detail, userLayout]);

  if (!project.detail) {
    return <p className="no-results">Project not found</p>;
  }

  return <DemoContent project={project.detail}/>;
}
