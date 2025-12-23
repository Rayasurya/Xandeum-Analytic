import styles from "./DataHubs.module.scss";
import DataSetHubs from "./DataSetHubs/Index";

export default function DataHubs() {
  return (
    <div className={styles.dataHubs}>
      <DataSetHubs />
    </div>
  )
}
