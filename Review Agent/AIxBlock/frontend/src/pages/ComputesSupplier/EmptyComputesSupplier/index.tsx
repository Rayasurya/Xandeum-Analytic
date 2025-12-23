import { useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import "./index.scss";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { infoDialog } from "@/components/Dialog";
import IconPlay from "@/assets/icons/IconPlay";
import { VIDEO_URL } from "@/constants/projectConstants";
import { useCheckVerifyNotification } from "@/hooks/computes/useCheckVerifyNotification";

const EmptyComputesSupplier = () => {
  const navigate = useNavigate();
  useCheckVerifyNotification()
  return (
    <div className="computes-supplier-empty">
      <div className="computes-supplier-empty-wrapper">
        <div className="computes-supplier-empty-wrapper__title">
          Lease Now Your Unused Compute
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
                  <VideoPlayer url={VIDEO_URL.RENT_OUT_COMPUTE} />
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
            onClick={() => navigate("/computes-supplier/add")}
          >
            Add New Compute
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyComputesSupplier;
