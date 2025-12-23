import { useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import "./index.scss";
import { useEffect } from "react";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlay from "@/assets/icons/IconPlay";
import { infoDialog } from "@/components/Dialog";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { VIDEO_URL } from "@/constants/projectConstants";

const EmptyModelsSeller = () => {
  const navigate = useNavigate();
  const userLayout = useUserLayout();

  useEffect(() => {
    userLayout.setIsLayoutEmpty(true);
    return () => {
      userLayout.clearLayoutEmpty();
    };
  }, [userLayout]);

  return (
    <div className="models-seller-empty">
      <div className="models-seller-empty-wrapper">
        <div className="models-seller-empty-wrapper__title">
          Start trading your pre-trained models
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
                  <VideoPlayer url={VIDEO_URL.COMMERCIALIZE} />
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
            onClick={() => navigate("/models-seller/add")}
            className="empty-page__action--add"
          >
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyModelsSeller;
