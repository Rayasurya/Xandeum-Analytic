import { useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import "./index.scss";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { infoDialog } from "@/components/Dialog";
import IconPlay from "@/assets/icons/IconPlay";
import { VIDEO_URL } from "@/constants/projectConstants";

const EmptySetupComputes = () => {
  const navigate = useNavigate();

  return (
    <div className="setup-computes-empty">
      <div className="setup-computes-empty-wrapper">
        <div className="setup-computes-empty-wrapper__title">
            Set up computes now
        </div>
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
                  <VideoPlayer url={VIDEO_URL.SETUP_COMPUTE} />
                ),
              });
            }}
          >
            Watch demo video
          </Button>
          <Button
            size="small"
            type="gradient"
            icon={<IconPlus />}
            className="empty-page__action--add"
            onClick={() => navigate("/computes/add")}
          >
            Add New Compute
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptySetupComputes;
