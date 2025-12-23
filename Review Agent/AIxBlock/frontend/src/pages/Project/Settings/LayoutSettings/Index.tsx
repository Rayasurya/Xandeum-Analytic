import { ReactNode } from "react";
import FooterSettings from "./Footer/Index";
import HeaderSettings from "./Header/Index";
import "./Index.scss";

interface ILayoutSettingsProps {
  children?: ReactNode;
  projectId?: number;
}

const LayoutContainer = (props: ILayoutSettingsProps) => {

  return <div className="c-layout-settings">{props.children}</div>;
};

const LayoutSettings = {
  Container: LayoutContainer,
  Header: HeaderSettings,
  Footer: FooterSettings,
};

export default LayoutSettings;
