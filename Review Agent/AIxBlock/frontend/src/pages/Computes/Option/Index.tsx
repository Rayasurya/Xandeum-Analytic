import { memo } from "react";
import IconArrowRightBold from "@/assets/icons/IconArrowRightBold";
import IconChevronRight from "@/assets/icons/IconChevronRight";
import Button from "@/components/Button/Button";
import "./Index.scss";

type TOptionProps = {
  title: string;
  subTitle: string;
  buttonText: string;
  type?: "primary" | "secondary" | "dark" | "hot" | "gradient" | "white" | "warning";
  onPress?: () => void;
  checked: boolean;
};

const MemoizedOption = (props: TOptionProps) => {
  const {
    title,
    subTitle,
    checked,
    buttonText,
    onPress = () => {},
    type = "white",
  } = props;

  return (
    <div className={`c-option__item ${checked ? "active" : ""}`}>
      <div className="c-option__content">
        {title && <h4 className="c-option__title">{title}</h4>}
        {subTitle && <span className="c-option__subtitle">{subTitle}</span>}
        {buttonText && (
          <div className="c-option__button__container">
            <Button
              className="c-option__button__container__button"
              size="small"
              type={type}
              icon={
                type === "white" ? <IconArrowRightBold /> : <IconChevronRight />
              }
              onClick={onPress}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Option = memo(MemoizedOption);

export default Option;
