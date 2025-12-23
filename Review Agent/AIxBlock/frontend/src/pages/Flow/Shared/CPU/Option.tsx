import { memo } from "react";
import Button from "@/components/Button/Button";
import { IconArrowRightBold } from "@/assets/icons/Index";
import IconChevronRight from "@/assets/icons/IconChevronRight";
import styles from "./Option.module.scss";

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
    onPress = () => { },
    type = "white",
  } = props;

  return (
    <>
      {title && <h4 className={styles.optionTitle}>{title}</h4>}
      {subTitle && <span className={styles.optionSubtitle}>{subTitle}</span>}
      {buttonText && (
        <div className={styles.optionContainer}>
          <Button
            className={checked ? styles.optionContainerActive : styles.optionContainerButton}
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
    </>
  );
};

const OptionCpu = memo(MemoizedOption);

export default OptionCpu;
