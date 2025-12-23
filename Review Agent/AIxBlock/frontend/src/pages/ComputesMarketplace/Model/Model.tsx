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
import Select from "@/components/Select/Select";
// import { STATUS_COMPUTE } from "@/constants/projectConstants";
import { useApi } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { TOKEN_NAME_DEFAULT, TOKEN_SYMBOL_DEFAULT } from "@/constants/projectConstants";

interface TModel {
  mlTitle?: string;
  updateAt?: string | Date;
  downloaded?: number | string;
  reactHeart?: number | string;
  mlDesc?: string;
  isFree?: boolean;
  price?: string | number;
  card?: any;
}

export interface RentalInfo {
  compute_gpu_id: number;
  token_name: string;
  token_symbol: string;
  amount: number;
  price: number;
  account: string;
}

type RentComputeCallback = (rentalInfo: RentalInfo) => void;

type TModelItem = {
  item: TModel;
  onClick?: MouseEventHandler;
  onRentCompute?: RentComputeCallback;
};

const MemoizedModelItem = (props: TModelItem) => {
  const { item, onRentCompute } = props;
  const {
    mlTitle,
    updateAt,
    downloaded,
    reactHeart,
    mlDesc,
    isFree,
    price,
    card,
  } = item;
  const auth = useAuth();
  const onChangeField = (val: number) => {
    const rentalInfo: RentalInfo = {
      compute_gpu_id: val,
      token_name: TOKEN_NAME_DEFAULT,
      token_symbol: TOKEN_SYMBOL_DEFAULT,
      amount: 0,
      price: 0,
      account: auth.user?.id as any,
    };
    onRentCompute?.(rentalInfo);
  };
  return (
    <div className="c-model-item">
      <Select
        className="p-marketplace__filters custom-filter"
        data={card}
        onChange={(e) => onChangeField(+e.value)}
        defaultValue={card[0]?.options[0]}
      />
      <div className="c-model-item__header">
        <h4>{mlTitle}</h4>
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
      <div className="c-model-item__footer">
        <h5>{mlDesc}</h5>
        <Button
          size="small"
          icon={<IconArrowRight />}
          className={`c-model-item__action${isFree ? "--free" : "--add"}`}
          onClick={props.onClick}
        >
          {isFree ? "Free" : price}
        </Button>
      </div>
    </div>
  );
};

const ModelItem = memo(MemoizedModelItem);

export default ModelItem;
