import {BenefitsSeparator} from "./icons";
import styles from "./PricingV2.module.scss";
import {CROWDSOURCING_PLANS} from "@/constants/pricingPlans";
import Price from "./Price";
import FeatureList from "./FeatureList";
import React from "react";

export default function Crowdsourcing() {
  return (
    <div className={styles.crowdsourcingPlans}>
      {Object.keys(CROWDSOURCING_PLANS).map(pn => (
        <div key={"plan-" + pn} className={styles.plan}>
          <Price plan={CROWDSOURCING_PLANS[pn]} isYearly={false}/>
          <div className={styles.planBenefitsSeparator}>
            <BenefitsSeparator/>
          </div>
          <FeatureList features={CROWDSOURCING_PLANS[pn].benefits ?? []}/>
        </div>
      ))}
    </div>
  );
}
