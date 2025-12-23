import IconClock from "@/assets/icons/IconClock";
import IconClockBold from "@/assets/icons/IconClockBold";
import IconMoneySendBold from "@/assets/icons/IconMoneySendBold";
import IconStoryBold from "@/assets/icons/IconStoryBold";
import IconWallet from "@/assets/icons/IconWallet";
import MiniCardItem from "../MiniCard/Index";
import "./Index.scss";

type ComputeItemProps = {};

const ComputeItem = (props: ComputeItemProps) => {
  return (
    <div className="p-compute-child-item">
      <div className="p-compute-child-item__header">
        <div className="p-compute-child-item__title">
          <b>Compute ID: 123456</b>
          <span>
            IP port: <b>228.137.185.86</b>
          </span>
        </div>
        <div className="p-compute-child-item__info">AMD MI100 - 32GB</div>
      </div>
      <div className="p-compute-child-item__detail">
        <div className="p-compute-child-item__detail-title">Details</div>
        <div className="p-compute-child-item__detail-subtitle">
          <b>Uptime Percentage</b>
          <span>50%</span>
        </div>
        <div className="p-compute-child-item__detail-progress-base">
          <div className="p-compute-child-item__detail-progress" style={{width: "50%"}}></div>
        </div>
      </div>
      <div className="p-compute-child-item__card-list">
        <MiniCardItem
          title="In Progress"
          subtitle="Status"
          icon={<IconStoryBold />}
        />
        <MiniCardItem
          title="10"
          subtitle="Compute hours served"
          icon={<IconClockBold />}
        />
        <MiniCardItem title="$10" subtitle="Earned" icon={<IconWallet />} />
        <MiniCardItem
          title="$10"
          subtitle="Slashed"
          cardType="error"
          icon={<IconMoneySendBold />}
        />
      </div>
    </div>
  );
};

export default ComputeItem;
