import { ReactNode } from "react";
import "./Index.scss";

type CardItemProps = {
  header: string;
  icon: ReactNode;
  title: string;
	subtitle: string;
	cardType?: 'normal' | 'error'
};

const CardItem = (props: CardItemProps) => {
  const { header, icon, title, subtitle, cardType } = props;
  return (
    <div className={`p-compute-card-item ${cardType}`}>
      <div className="p-compute-card-item__header">
        <b>{header}</b>
        {icon}
      </div>
      <div className="p-compute-card-item__title">{title}</div>
      <div className="p-compute-card-item__subtitle">{subtitle}</div>
    </div>
  );
};

export default CardItem;
