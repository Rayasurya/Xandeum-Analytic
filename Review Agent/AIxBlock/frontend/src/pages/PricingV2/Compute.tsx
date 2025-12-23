import {Lighting} from "./icons";
import {ButtonRentCompute} from "./buttons";
import styles from "./PricingV2.module.scss";

export default function Compute() {
  return (
    <div className={styles.computeContainer}>
      <div className={styles.computeText}>
        <Lighting />
        You pay directly to GPU providers only if rented <small>(No transaction fee)</small>
      </div>
      <ButtonRentCompute />
    </div>
  );
}
