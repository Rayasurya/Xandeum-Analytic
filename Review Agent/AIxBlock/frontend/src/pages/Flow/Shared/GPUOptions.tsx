import { useState } from 'react';
import Button, { TButtonProps } from '../../../components/Button/Button';
import OptionCpu from './CPU/Option';
import styles from './GPUOptions.module.scss';
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import RentedList from "./CPU/RentedList";
import {useFlowProvider} from "../FlowProvider";
import {TProjectModel} from "@/models/project";
import AutoProvision from "@/components/AutoProvision/AutoProvision";

const options = [
  {
    id: 2,
    title: "Bring your own computes",
    subTitle:
      "Add your own compute resources here, and whenever you need more, you can easily rent additional resources from the marketplace.",
    buttonText: "Start Now",
    type: "gradient",
    target: "self-host",
  },
  {
    id: 3,
    title: "Rent compute from decentralized marketplace",
    subTitle:
      "Access affordable, decentralized computing power with no setup or vendor lock-in, secured by blockchain technology.",
    buttonText: "Start Now",
    type: "primary",
    target: "marketplace",
  },
];

export type TProps = {
  project: TProjectModel;
}

export default function GPUOptions(_: TProps) {
  const {computes, gotoSelfHostWithReturn, gotoComputeMarketplaceWithReturn} = useFlowProvider();
  const { list: rentedGpusList, refresh, error } = computes;
  const [active, setOptActive] = useState<number | null>(2);

  const onSelectOpt = (val: number) => {
    setOptActive(val);
  };

  if (error) {
    return <EmptyContent message={error} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => refresh(),
      }
    ]} />
  }

  return (rentedGpusList.length > 0
    ? (
      <div className={styles.gpuOptions}>
        <div className={styles.gpuHeading}>
          <h3 className={styles.heading}>Available computes</h3>
          <div className={styles.rightButtons}>
            <Button
              size="tiny"
              onClick={gotoSelfHostWithReturn}
            >
              Add my compute
            </Button>
            <Button
              size="tiny"
              onClick={gotoComputeMarketplaceWithReturn}
            >
              Rent compute from marketplace
            </Button>
            <AutoProvision />
          </div>
        </div>
        <RentedList
          rentedGpus={rentedGpusList}
          onDeleteCompute={computes.delete}
        />
      </div>
    )
    : (
      <div className={styles.emptyList}>
        <AutoProvision />
        <div className={styles.cpuContent}>
          {
            options.map(opt => (
              <div
                className={`${styles.cpuItem} ${active === opt.id ? styles.cpuItemActive : ""
                  }`}
                key={`key-opt-${opt.id}`}
                onClick={() => onSelectOpt(opt.id)}
              >
                <OptionCpu
                  title={opt.title}
                  subTitle={opt.subTitle}
                  checked={active === opt.id}
                  buttonText={opt.buttonText}
                  type={opt.type as TButtonProps["type"]}
                  onPress={opt.target === "self-host" ? gotoSelfHostWithReturn : gotoComputeMarketplaceWithReturn}
                />
              </div>
            ))
          }
        </div>
      </div>
    )
  )
}
