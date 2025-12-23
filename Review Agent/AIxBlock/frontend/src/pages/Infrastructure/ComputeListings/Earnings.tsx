import IconArrowUpTail from "@/assets/icons/IconArrowUpTail";
import IconCardStack from "@/assets/icons/IconCardStack";
import IconClock from "@/assets/icons/IconClock";
import IconCricleDollar from "@/assets/icons/IconCricleDollar";
import IconCricleDollarOutline from "@/assets/icons/IconCricleDollarOutline";
import IconMoneySend from "@/assets/icons/IconMoneySend";
import Button from "@/components/Button/Button";
import { LightWeightChart } from "@/components/LightWeightChart";
import "./Earnings.scss";
import CardItem from "./EarningComponents/Card/Index";
import React from "react";
import ListingsLayout from "./ListingsLayout";

type EarningsAndRewardsProps = {};

const initialData: {time: string, value: number}[] = [
	// { time: '2023-01-20', value: 1320.51 },
	// { time: '2023-02-20', value: 10.11 },
	// { time: '2023-03-20', value: 1270.02 },
	// { time: '2023-04-20', value: 270.32 },
	// { time: '2023-05-20', value: 1250.17 },
	// { time: '2023-06-20', value: 1280.89 },
	// { time: '2023-07-20', value: 250.46 },
	// { time: '2023-08-20', value: 230.92 },
	// { time: '2023-09-20', value: 1220.68 },
	// { time: '2023-10-20', value: 220.67 },
	// { time: '2023-11-20', value: 1220.67 },
	// { time: '2023-12-20', value: 1220.67 },
];

const EarningsAndRewards = (_: EarningsAndRewardsProps) => {
  return (
    <ListingsLayout>
      <div className="p-infrstructure-earnings">
        <div className="p-infrstructure-earnings__row">
          <div className="p-infrstructure-earnings__chart-wrapper">
            <div className="p-infrstructure-earnings__chart-header">
              <div className="p-infrstructure-earnings__chart-title">
                <b>Total Earning </b>
                <span>(coming soon)</span>
              </div>
              <Button
                iconPosition="left"
                icon={<IconCricleDollar />}
                type="primary"
              >
                Withdraw
              </Button>
            </div>
            <div className="p-infrstructure-earnings__chart-summary">
              <b>$0</b>
              <span>
                <IconArrowUpTail /> 0%
              </span>
            </div>
            <div className="p-infrstructure-earnings__chart-view">
              <LightWeightChart data={initialData}/>
            </div>
          </div>
          <div className="p-infrstructure-earnings__chart-item-list">
            <div className="p-infrstructure-earnings__chart-item-row">
              <CardItem
                header={"Hours Served"}
                icon={<IconClock />}
                title={"-"}
                subtitle={"Total Compute Hours Served"}
              />
              <CardItem
                header={"Compute Served"}
                icon={<IconCardStack />}
                title={"-"}
                subtitle={"Total Compute Served"}
              />
            </div>
            <div className="p-infrstructure-earnings__chart-item-row">
              <CardItem
                header={"Pending Earnings"}
                icon={<IconCricleDollarOutline />}
                title={"-"}
                subtitle={"Tentative Pending Earnings"}
              />
              <CardItem
                header={"Slashed"}
                icon={<IconMoneySend />}
                title={"-"}
                subtitle={"Slashed Rewards"}
                cardType="error"
              />
            </div>
          </div>
        </div>
        {/*<div className="p-infrstructure-earnings__filter-bar">
          <div className="p-infrstructure-earnings__input">
            <IconSearch className="p-infrstructure-earnings__float-icon" />
            <InputBase placeholder="Search asset" />
          </div>
          <div className="p-infrstructure-earnings__filter-actions">
            <div className="p-infrstructure-earnings__c-select">
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
            <div className="p-infrstructure-earnings__c-select">
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
        <div className="p-infrstructure-earnings__compute-content">
          <ComputeItem />
          <ComputeItem />
        </div>*/}
      </div>
    </ListingsLayout>
  );
};

export default EarningsAndRewards;
