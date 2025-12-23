import { MouseEventHandler, memo } from "react";

import {
  IconArrowRight,
  IconClock,
  IconDownload,
  IconHeart,
  IconRevenue,
} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { TModelMarketplace } from "@/models/modelMarketplace";
import { formatDate } from "@/utils/formatDate";
import "./Index.scss";

interface IModelItemProps {
  item: TModelMarketplace;
  onClick?: MouseEventHandler;
}

const MemoizedModelItem = (props: IModelItemProps) => {
  const { item, onClick } = props;
  const { name, updated_at, model_desc, price, file } = item;
  return (
    <div className="c-ml-model-item">
      <div className="c-ml-model-item__header">
        <h4 className="c-ml-model-item__header-title">
          <img
            className="c-ml-model-item__logo"
            src={file ? file : require("@/assets/images/logo.png")}
            alt={name}
          />
          <div className="c-ml-model-item__header-title-text">{name}</div>
        </h4>
        {model_desc && (
          <div className="c-ml-model-item__header-desc" dangerouslySetInnerHTML={{__html: model_desc}} />
        )}
      </div>
      <div className="c-ml-model-item__content">
        <div className="c-ml-model-item__text heart">
          <IconHeart isLike={item.user_liked}/>
          {item.like_count}
        </div>
        <div className="c-ml-model-item__text updated">
          <IconClock />
          {`updated ${formatDate(updated_at as string, "HH")}h ago`}
        </div>
      </div>
      <div className="c-ml-model-item__content">
        <div className="c-ml-model-item__text downloaded">
          <IconDownload />
          {item.download_count}
        </div>
        <div
          className={`c-ml-model-item__text ${
            price <= 0 ? "free" : "revenue"
          }`}
        >
          <IconRevenue />
          {price <= 0 ? "FREE" : price}
        </div>
      </div>
      <Button
        size="small"
        icon={<IconArrowRight with={15} height={15} />}
        className="c-ml-model-item__action--see"
        onClick={onClick}
      >
        See More
      </Button>
    </div>
  );
};

const ModelItem = memo(MemoizedModelItem);

export default ModelItem;
