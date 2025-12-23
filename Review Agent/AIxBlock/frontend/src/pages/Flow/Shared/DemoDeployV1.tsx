import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Select from "@/components/Select/Select";
import { useMyCheckpoints } from "@/hooks/settings/ml/useMyCheckpoints";
import { TProjectModel } from "@/models/project";
import styles from "./DemoDeployV1.module.scss";

type TDemeAndDeployProps = {
  project: TProjectModel | null;
}

export default function DemoDeploy(props: TDemeAndDeployProps) {
  const { project } = props;
  const params = useParams();
  const projectID = useMemo(() => {
    return project?.id ? project?.id : parseInt(params?.projectID ?? "0");
  }, [project?.id, params?.projectID]);
  const { checkpoint } = useMyCheckpoints({ project_id: projectID.toString() });
  // eslint-disable-next-line
  const [_, setCheckpointId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<number>(0);

  return (
    <div className={styles.demoDeploy}>
      <h4 className={styles.heading}>Create a Dedicated Endpoint</h4>
      <div className={styles.section}>
        <p className={styles.label}>Model Version</p>
        <div className={styles.modelSelect}>
          <Select
            // Todo: Handel implement api
            data={checkpoint}
            onChange={(val) => {
              setCheckpointId(val.value);
            }}
            placeholderText="Model list"
          />
          <Button
            type="hot"
            className="c-ml--action reset"
          >
            Choose Version
          </Button>
        </div>
      </div>
      <div className={styles.section}>
        <div className={`${styles.flex} ${styles.itemCenter} ${styles.children} ${styles.flexEnd} ${styles.gap12}`}>
          <Select
            // Todo: Handel implement api
            data={[]}
            label="Model Repository"
          />
          <InputBase
            value={""}
            allowClear={false}
            placeholder="input number"
            label="Endpoint Name"
          />
        </div>
      </div>
      <div className={styles.section}>
        <div className={`${styles.groupCol}`}>
          <div className={`${styles.flex} ${styles.itemCenter} ${styles.gap12}`}>
            <div className={`${styles.flex} ${styles.itemCenter} ${styles.children} ${styles.flexEnd} ${styles.gap12} ${styles.widthFull}`}>
              <div className={styles.tabs}>
                <div
                  className={`${styles.tab} ${activeTab === 0 && styles.tabActive}`}
                  onClick={() => {
                    setActiveTab(0);
                  }}
                >
                  CPU
                </div>
                <div
                  className={`${styles.tab} ${activeTab === 1 && styles.tabActive}`}
                  onClick={() => {
                    setActiveTab(1);
                  }}
                >
                  GPU
                </div>
                <div
                  className={`${styles.tab} ${activeTab === 2 && styles.tabActive}`}
                  onClick={() => {
                    setActiveTab(2);
                  }}
                >
                  INF2
                </div>
              </div>
              <Select
                // Todo: Handel implement api
                data={[]}
                placeholderText="us-east-1"
              />
            </div>
            <div className={styles.line} />
          </div>
          <div className={styles.items}>
            {[1, 2, 3, 4].map((item, index) => (
              // Todo: Handel implement api
              <div
                className={`${styles.item} ${currentItem === index ? styles.itemActive : ""}`}
                key={index}
                onClick={() => setCurrentItem(index)}
              >
                <p className={styles.itemName}>Intel Sapphire Rapids</p>
                <p className={styles.itemUnit}>1 vCPU · 2 GB</p>
                <p className={styles.itemPrice}>$ 0.033/h</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <p className={styles.title}>Automatic Scale-to-Zero</p>
        <p className={styles.sub}>Endpoints scaled to 0 replicas are not billed. They may take some time to scale back up once they start receiving requests again</p>
        <Select
          data={[]}
        />
      </div>
      <div className={styles.action}>
        <Button type="secondary" className={styles.cancel}>
          Cancel
        </Button>
        <Button className={styles.deploy}>
          Deploy
        </Button>
      </div>
    </div>
  )
}

