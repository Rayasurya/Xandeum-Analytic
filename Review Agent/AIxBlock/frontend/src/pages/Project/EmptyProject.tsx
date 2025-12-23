import IconPlay from "@/assets/icons/IconPlay";
import { IconPlus } from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { infoDialog } from "@/components/Dialog";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { VIDEO_URL } from "@/constants/projectConstants";

const EmptyProject = () => {
  const navigate = useNavigate();

  return (
    <div className="page-projects empty">
      <div className="page-projects__wrapper">
        <p className="page-projects__title">
          No projects here? <br /> Create one and start building your AI models
        </p>
        <div className="empty-page__action">
          <Button
            size="small"
            type="secondary"
            icon={<IconPlay />}
            className="empty-page__action--watch"
            onClick={e => {
              e.stopPropagation();
              infoDialog({
                cancelText: null,
                className: "model-demo-video",
                message: (
                  <VideoPlayer url={VIDEO_URL.BUILD_AI} />
                ),
              });
            }}
          >
            Watch demo video
          </Button>
          <Button
            size="small"
            type="gradient"
            icon={<IconPlus width={16} height={16} />}
            onClick={() => navigate("/dashboard")}
            className="empty-page__action--add"
          >
            Select a flow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyProject;
