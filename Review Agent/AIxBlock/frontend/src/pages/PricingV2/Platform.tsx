import Switch from "@/components/Switch/Switch";
import React from "react";
import styles from "./PricingV2.module.scss";
import Price from "./Price";
import {PLATFORM_PLANS} from "@/constants/pricingPlans";
import FeatureList from "./FeatureList";
import {BenefitsSeparator} from "./icons";

export default function Platform() {
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <div>
      <div className={styles.cycles}>
        <span
          className={styles.cyclesItem + " " + (!isYearly ? styles.cyclesActive : "")}
          onClick={() => setIsYearly(false)}
        >
          Monthly
        </span>
        <Switch checked={isYearly} onChange={setIsYearly} />
        <span
          className={styles.cyclesItem + " " + (isYearly ? styles.cyclesActive : "")}
          onClick={() => setIsYearly(true)}
        >
          Yearly
        </span>
        <span className={styles.cyclesOff}>30% OFF</span>
      </div>
      <div className={styles.plans}>
        {Object.keys(PLATFORM_PLANS).map(pn => (
          <div key={"plan-" + pn} className={styles.plan}>
            <Price plan={PLATFORM_PLANS[pn]} isYearly={isYearly} />
            {PLATFORM_PLANS[pn].features && <FeatureList features={PLATFORM_PLANS[pn].features ?? []} />}
            <div className={styles.planBenefitsSeparator}>
              <BenefitsSeparator />
            </div>
            {PLATFORM_PLANS[pn].benefits && <FeatureList features={PLATFORM_PLANS[pn].benefits ?? []} />}
          </div>
        ))}
      </div>
    </div>
  );
}
