import React, { memo, useMemo, useState } from "react";
import IconCirclePlus from "@/assets/icons/IconCirclePlus";
import Button from "@/components/Button/Button";
import "./Index.scss";
import CheckboxSelect from "../MultipleSelect/MultipleSelect";
import { SelectedOption } from "../Index";
import {TOKEN_SYMBOL_DEFAULT} from "@/constants/projectConstants";

interface IIVpsItemProps {
  item: any;
  label: string;
  isCPU?: boolean;
  onHandleRent?: (id: number, selectedOptions: SelectedOption[]) => void
}

const MemoizedVpsItem: React.FC<IIVpsItemProps> = ({
  item,
  onHandleRent = () => { },
  label,
  isCPU = false

}: IIVpsItemProps) => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption[]>([]);

  const results = useMemo(() => {
    let data = {
      name: "x",
      diskType: "x",
      os: "x",
      ram: "x",
      cpu: "x",
      price: "$ x/hour",
    };
    if (item) {
      const { config } = item;
      if (config && typeof config === "string") {
        try {
          data = JSON.parse(config.replace(/'/g, '"'));
        } catch (error) { }
      }
      if (config && typeof config === "object") {
        data = config as any;
      }
    }
    return data;
  }, [item]);

  const compute_type = useMemo(() => {
    let data = '';
    if (item) {
      const keys = Object.keys(item);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstItem = item[firstKey];
        if (firstItem && firstItem.length > 0) {
          data = firstItem[0].compute_marketplace.compute_type;
        }
      }
    }
    // console.log(data)
    return data;
  }, [item]);

  const handleSelect = (selectedOptions: SelectedOption[]) => {    
    setSelectedOption(selectedOptions)
  }

  const handleRent = () => {
    if (isCPU) {
      const price = item?.cpu_price?.price ?? 0;

      onHandleRent(item.id, [{
        id: item.id.toString(),
        label: label,
        price,
        quantity: 1,
        gpu_name: "",
        ids: [],
        services: "label-tool",
        results: {},
        tokenSymbol: TOKEN_SYMBOL_DEFAULT,
        totalPrice: price,
        is_cpu: true,
        hours: 1,
      }])
    } else {
      onHandleRent(item.id, selectedOption);
    }
  }

  const getServiceCompute = (value: string) => {
    switch (value) {
      case 'storage':
        return 'Storage';
      case 'model-training':
        return 'Model Training';
      case 'label-tool':
        return 'Labeling Tool';
      default:
        return 'All';
    }
  }

  return (
    <div className="vps-item" style={{ position: 'relative' }}
    >
      <div className="vps-item__header">
        <CheckboxSelect
          onHandleSelect={handleSelect}
          label={isCPU ? label : Object.keys(item)[0]}
          options={Object.keys(item).flatMap(gpuName =>
            Array.isArray(item[gpuName]) ? item[gpuName].map((gpu: any) => {
              return ({
                id: gpu.id.toString(),
                label: gpu.gpu_name,
                value: gpu.prices[0].price,
                price: gpu.prices[0].price,
                services: gpu.compute_marketplace.compute_type,
                tokenSymbol: gpu.prices[0].token_symbol,
                vast_contract_id: gpu.vast_contract_id,
                hours: 1,
              })
            }) : []
          )}
        />
      </div>
      <div className="vps-item__specs">
        <div className="vps-item__specs__row between">
          <span className="vps-item__specs__label">
            Service:
          </span>
          <span className="vps-item__specs__value">{getServiceCompute(compute_type)}</span>
        </div>
        <div className="vps-item__specs__row between">
          <span className="vps-item__specs__label">
            Type:
          </span>
          <span className="vps-item__specs__value">{item.is_using_cpu ? 'CPU' : 'GPU'}</span>
        </div>
        {isCPU && <><div className="vps-item__specs__row between">
          <span className="vps-item__specs__label">
            Disk type: {results.diskType}
          </span>
          <span className="vps-item__specs__value">Os: {results.os}</span>
        </div>
          <div className="vps-item__specs__row between">
            <span className="vps-item__specs__label">
              vRAM
            </span>
            <span className="vps-item__specs__value">{results.ram} GB</span>
          </div>
          {/* <div className="vps-item__specs__row between">
            <span className="vps-item__specs__label">
              vCPU
            </span>
            <span className="vps-item__specs__value">{results.cpu}</span>
          </div> */}
        </>
        }
      </div>
      <div className="vps-item__footer">
        <Button
          type="primary"
          disabled={!selectedOption.length && !item.is_using_cpu}
          size="medium"
          // onClick={onChangeRent}
          onClick={handleRent}
        >
          Rent
          <IconCirclePlus />
        </Button>
      </div>
    </div>
  );
};

const VpsItem = memo(MemoizedVpsItem);

export default VpsItem;
