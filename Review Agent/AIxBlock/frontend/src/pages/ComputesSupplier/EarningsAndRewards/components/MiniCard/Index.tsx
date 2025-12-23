import { ReactNode } from "react";
import "./Index.scss";

type MiniCardItemProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  cardType?: "normal" | "error";
};

const MiniCardItem = (props: MiniCardItemProps) => {
  const {  icon, title, subtitle, cardType } = props;
  return (
    <div className={`p-compute-mini-card-item ${cardType}`}>
      <div className="p-compute-mini-card-item__content">
        <div className="p-compute-mini-card-item__title">{title}</div>
        <div className="p-compute-mini-card-item__subtitle">{subtitle}</div>
      </div>
      {icon}
    </div>
  );
};

export default MiniCardItem;
