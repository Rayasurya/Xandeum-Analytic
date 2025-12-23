import {BenefitsSeparator} from "./icons";
import styles from "./PricingV2.module.scss";
import {MODEL_PLANS} from "@/constants/pricingPlans";
import Price from "./Price";
import FeatureList from "./FeatureList";
import React from "react";

export default function Model() {
  return (
    <div className={styles.modelPlans}>
      {Object.keys(MODEL_PLANS).map(pn => (
        <div key={"plan-" + pn} className={styles.plan}>
          <Price plan={MODEL_PLANS[pn]} isYearly={false}/>
          <div className={styles.planBenefitsSeparator}>
            <BenefitsSeparator/>
          </div>
          <FeatureList features={MODEL_PLANS[pn].benefits ?? []}/>
        </div>
      ))}
    </div>
  );
}
