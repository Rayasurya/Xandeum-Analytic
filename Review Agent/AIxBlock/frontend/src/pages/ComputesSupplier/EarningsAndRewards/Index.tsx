import IconArrowUpTail from "@/assets/icons/IconArrowUpTail";
import IconBarcodeBold from "@/assets/icons/IconBarcodeBold";
import IconCard from "@/assets/icons/IconCard";
import IconCardStack from "@/assets/icons/IconCardStack";
import IconClock from "@/assets/icons/IconClock";
import IconCricleDollar from "@/assets/icons/IconCricleDollar";
import IconCricleDollarOutline from "@/assets/icons/IconCricleDollarOutline";
import IconDollar from "@/assets/icons/IconDollar";
import IconMoneySend from "@/assets/icons/IconMoneySend";
import IconStoryBold from "@/assets/icons/IconStoryBold";
import IconSearch from "@/assets/icons/iconSearch";
import Button from "@/components/Button/Button";
import LineChart from "@/components/Chart/LineChart";
import InputBase from "@/components/InputBase/InputBase";
import { LightWeightChart } from "@/components/LightWeightChart";
import Select from "@/components/Select/Select";
import { STATUS_COMPUTE } from "@/constants/projectConstants";
import "./Index.scss";
import CardItem from "./components/Card/Index";
import ComputeItem from "./components/ComputeItem/Index";

type EarningsAndRewardsProps = {};

const createFakeData = () => {
  // This function creates data that doesn't look entirely random
  const data = [];
  for (let x = 0; x <= 30; x++) {
    const random = Math.random();
    const temp: any = data.length > 0 ? data[data.length - 1].y : 50;
    const y =
      random >= 0.45
        ? temp + Math.floor(random * 20)
        : temp - Math.floor(random * 20);
    data.push({ x, y });
  }
  return data;
};

const initialData = [
	{ time: '2023-01-20', value: 1320.51 },
	{ time: '2023-02-20', value: 10.11 },
	{ time: '2023-03-20', value: 1270.02 },
	{ time: '2023-04-20', value: 270.32 },
	{ time: '2023-05-20', value: 1250.17 },
	{ time: '2023-06-20', value: 1280.89 },
	{ time: '2023-07-20', value: 250.46 },
	{ time: '2023-08-20', value: 230.92 },
	{ time: '2023-09-20', value: 1220.68 },
	{ time: '2023-10-20', value: 220.67 },
	{ time: '2023-11-20', value: 1220.67 },
	{ time: '2023-12-20', value: 1220.67 },
];

const EarningsAndRewards = (props: EarningsAndRewardsProps) => {
  return (
    <div className="p-computes-earning">
      <div className="p-computes-earning__row">
        <div className="p-computes-earning__chart-wrapper">
          <div className="p-computes-earning__chart-header">
            <div className="p-computes-earning__chart-title">
              <b>Total Earning </b>
              <span>April 2024</span>
            </div>
            <Button
              iconPosition="left"
              icon={<IconCricleDollar />}
              type="primary"
            >
              Withdraw
            </Button>
          </div>
          <div className="p-computes-earning__chart-summary">
            <b>$1150.23</b>
            <span>
              <IconArrowUpTail /> 2.0%
            </span>
          </div>
					<div className="p-computes-earning__chart-view">
						<LightWeightChart data={initialData}/>
            {/* <LineChart
              data={createFakeData()}
              svgWidth={200}
              svgHeight={40}
            ></LineChart> */}
          </div>
        </div>
        <div className="p-computes-earning__chart-item-list">
          <div className="p-computes-earning__chart-item-row">
            <CardItem
              header={"Hours Served"}
              icon={<IconClock />}
              title={"55"}
              subtitle={"Total Compute Hours Served"}
            />
            <CardItem
              header={"Compute Served"}
              icon={<IconCardStack />}
              title={"55"}
              subtitle={"Total Compute Served"}
            />
          </div>
          <div className="p-computes-earning__chart-item-row">
            <CardItem
              header={"Pending Earnings"}
              icon={<IconCricleDollarOutline />}
              title={"$555"}
              subtitle={"Tentative Pending Earnings"}
            />
            <CardItem
              header={"Slashed"}
              icon={<IconMoneySend />}
              title={"$55"}
              subtitle={"Slashed Rewards"}
              cardType="error"
            />
          </div>
        </div>
      </div>
      <div className="p-computes-earning__filter-bar">
        <div className="p-computes-earning__input">
          <IconSearch className="p-computes-earning__float-icon" />
          <InputBase placeholder="Search asset" />
        </div>
        <div className="p-computes-earning__filter-actions">
          <div className="p-computes-earning__c-select">
            <IconStoryBold />
            <Select
              placeholderText="Status"
              data={[
                {
                  label: "",
                  options: [{ label: "Status", value: "status" }],
                },
              ]}
              onChange={(val) => {}}
            />
          </div>
          <div className="p-computes-earning__c-select">
            <IconBarcodeBold />
            <Select
              placeholderText="Hardware"
              data={[
                {
                  label: "",
                  options: [{ label: "Hardware", value: "hardware" }],
                },
              ]}
              onChange={(val) => {}}
            />
          </div>
        </div>
      </div>
      <div className="p-computes-earning__compute-content">
        <ComputeItem />
        <ComputeItem />
      </div>
    </div>
  );
};

export default EarningsAndRewards;
