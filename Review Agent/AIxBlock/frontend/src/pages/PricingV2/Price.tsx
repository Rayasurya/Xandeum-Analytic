import {TPricingPlan} from "@/constants/pricingPlans";
import styles from "./PricingV2.module.scss";
import React from "react";
import {ButtonComingSoon, ButtonContactSale, ButtonContinue, ButtonExplore} from "./buttons";
import {formatFloat} from "@/utils/customFormat";
import {Lighting} from "./icons";

export type TProps = {
  plan: TPricingPlan;
  isYearly: boolean;
}

export default function Price({plan, isYearly}: TProps) {
  const price = React.useMemo(() => {
    if (typeof plan.monthlyPrice === "number" && plan.monthlyPrice > 0) {
      return isYearly ? Math.floor((plan.monthlyPrice * 12) * (1 - plan.yearlyDiscount)) : plan.monthlyPrice;
    } else {
      return plan.monthlyPrice;
    }
  }, [plan.monthlyPrice, plan.yearlyDiscount, isYearly]);

  return (
    <div className={styles.planPriceBlock}>
      {plan.isPopular && (
        <div className={styles.planPopular}>
          <Lighting />
          MOST POPULAR
        </div>
      )}
      <div className={styles.planName}>{plan.name}</div>
      <div className={styles.planPrice}>
        {
          plan.monthlyPrice >= 0 && typeof price === "number"
            ? "$" + formatFloat(price, 3)
            : typeof plan.monthlyPrice === "string" ? plan.monthlyPrice : "Custom"
        }
        {plan.monthlyPrice === 0 && <small>free</small>}
        {plan.monthlyPrice > 0 && <small>{isYearly ? "per year" : "per month"}</small>}
        {plan.priceUnit && <small>{plan.priceUnit}</small>}
      </div>
      {plan.desc && <div className={styles.planDesc}>{plan.desc}</div>}
      <div className={styles.planCta}>
        {plan.cta === "COMING-SOON" && <ButtonComingSoon/>}
        {plan.cta === "CONTINUE" && <ButtonContinue />}
        {plan.cta === "CONTACT-SALE" && <ButtonContactSale />}
        {plan.cta === "EXPLORE" && <ButtonExplore />}
      </div>
    </div>
  );
}
