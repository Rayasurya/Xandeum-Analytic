import { MouseEventHandler, memo } from "react";
import {
  IconArrowRight,
  IconClock,
  IconDownload,
  IconHeart,
} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import { formatDate } from "@/utils/formatDate";
import "./Index.scss";

interface TModel {
  mlTitle?: string;
  updateAt?: string | Date | null;
  downloaded?: number | string;
  reactHeart?: number | string;
  mlDesc?: string | null;
  isFree?: boolean;
  price?: string | number;
}

type TModelItem = {
  item: TModel;
  onClick?: MouseEventHandler;
};

const MemoizedModelItem = (props: TModelItem) => {
  const { item, onClick } = props;
  const { mlTitle, updateAt, downloaded, reactHeart, mlDesc, isFree, price } =
    item;
  return (
    <div className="c-model-item">
      <div className="c-model-item__header">
        <span />
        <h4>{mlTitle}</h4>
      </div>
      <div className="c-model-item__footer">
        {mlDesc}
      </div>
      <div className="c-model-item__content">
        <div className="c-model-item__updated">
          <IconClock />
          {`updated ${formatDate(updateAt as string, "HH")}h ago`}
        </div>
        <div className="c-model-item__downloaded">
          <IconDownload />
          {downloaded}
        </div>
        <div className="c-model-item__heart">
          <IconHeart />
          {reactHeart}
        </div>
      </div>
      <Button
        size="small"
        icon={<IconArrowRight />}
        className={`c-model-item__action${isFree ? "--free" : "--add"}`}
        onClick={onClick}
      >
        {isFree ? "Free" : price}
      </Button>
    </div>
  );
};

const ModelItem = memo(MemoizedModelItem);

export default ModelItem;
