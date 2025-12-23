import React from "react";
import Button, {TButtonProps} from "../Button/Button";
import "./EmptyContent.scss";
import IconLogoV2 from "@/assets/icons/IconLogoV2";
import IconLoadingV2 from "@/assets/icons/IconLoadingV2";

export type TProps = {
  buttons?: TButtonProps[],
  message?: string | React.ReactNode,
  hideIcon?: boolean,
}

export default function EmptyContent({buttons, message, hideIcon}: TProps = {
  message: "No data found",
}) {
  const buttonsNode = React.useMemo(() => {
    return buttons ? buttons.map((b, idx) => <Button key={"b-" + idx} {...b} />) : null;
  }, [buttons]);

  const messageNode = React.useMemo(() => {
    return message ? <div className="c-empty-content__text">{message}</div> : null;
  }, [message]);

  return (
    <div className="c-empty-content">
      <div className="c-empty-content__wrapper">
        {!hideIcon && (
          <div className="c-empty-content__image">
            <IconLogoV2 width={50} height={50} />
            <IconLoadingV2 width={100} height={100} />
          </div>
        )}
        {messageNode}
        <div className="c-empty-content__buttons">
          {buttonsNode}
        </div>
      </div>
    </div>
  );
}
