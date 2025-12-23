import React from "react";
import "./Header.scss";

export type THeaderProps = {
  title?: string,
  actions?: React.ReactNode,
}

export default function Header({title, actions}: THeaderProps) {
  return (
    <div className="c-header">
      <div className="c-header__header-block">
        <div className="c-header__header">
          {title && <div className="c-header__heading">
            <h4>{title}</h4>
          </div>}
          {actions && <div className="c-header__actions">
            {actions}
          </div>}
        </div>
      </div>
    </div>
  );
}
