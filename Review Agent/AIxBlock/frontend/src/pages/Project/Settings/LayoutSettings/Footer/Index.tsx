import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import "./Index.scss";
import { getPath } from "../utils";
import { IconArrowSquareLeft } from "@/assets/icons/Index";

interface IFooterSettingsProps {
  nextUrl?: string;
  prevUrl?: string;
  onSkip?: () => void;
  onNext?: () => void;
}

const FooterSettings = (props: IFooterSettingsProps) => {
  const { nextUrl, prevUrl, onSkip, onNext } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const activeStepParent = getPath(location.pathname, 2);
  const activeStepChild = getPath(location.pathname, 1);
  const isDisable =
    (activeStepParent === "settings" && activeStepChild === "general") ||
    activeStepChild === "create-project";

  const onNextUrl = () => {
    onNext && onNext();
    nextUrl && navigate(nextUrl);
  };

  const onPrevUrl = () => {
    prevUrl && navigate(prevUrl);
  };

  return (
    <div className="c-footer-settings">
      <Button
        icon={<IconArrowSquareLeft />}
        disabled={isDisable}
        onClick={() => onPrevUrl()}
        className="c-footer-settings__icon back"
        type="secondary"
      >
        Back
      </Button>
      <Button
        className="c-footer-settings__icon skip"
        disabled={activeStepChild === "create-project"}
        type="hot"
        onClick={onSkip}
      >
        Skip
      </Button>
      <Button
        icon={<IconArrowSquareLeft />}
        className="c-footer-settings__icon next"
        onClick={() => onNextUrl()}
        type="secondary"
      >
        Next
      </Button>
    </div>
  );
};

export default FooterSettings;
