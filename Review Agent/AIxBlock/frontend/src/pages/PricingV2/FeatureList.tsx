import {TPricingPlanFeature} from "@/constants/pricingPlans";
import styles from "./PricingV2.module.scss";

export default function FeatureList({features}: {features: TPricingPlanFeature[]}) {
  return (
    <div className={styles.featureList}>
      {features.map(f => (
        <div className={styles.feature}>
          <div>{f.name}</div>
          {f.type === "COMING-SOON" && <div className={styles.featureComingSoon}>Coming soon</div>}
          {f.type === "UNLIMITED" && <div className={styles.featureUnlimited}>Unlimited</div>}
          {f.type === "CHECKED" && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z"
                fill="#27BE69"/>
            </svg>
          )}
          {f.type === "HIGHEST-REWARD" && <div className={styles.featureHighestReward}>Highest reward</div>}
          {f.type === "ELIGIBLE" && <div className={styles.featureEligible}>Eligible</div>}
          {f.type === "NONE" && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.92 12.75H7.92C7.51 12.75 7.17 12.41 7.17 12C7.17 11.59 7.51 11.25 7.92 11.25H15.92C16.33 11.25 16.67 11.59 16.67 12C16.67 12.41 16.34 12.75 15.92 12.75Z"
                fill="#E3E8EF"/>
            </svg>
          )}
          {f.type === "TEXT" && <div className={styles.featureHighestReward}>{f.text}</div>}
        </div>
      ))}
    </div>
  );
}
