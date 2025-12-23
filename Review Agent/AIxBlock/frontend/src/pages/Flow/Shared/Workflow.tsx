import { IconLocation } from "@/assets/icons/Index";
import styles from "./WorkFlow.module.scss";

export type FlowItem = {
  step: number;
  label: string;
  key: string;
  children?: JSX.Element;
  icon: JSX.Element;
  isCompleted: boolean;
  isCurrent: boolean;
  tip?: string;
  onClick?: () => void;
};

type TWorkflowProps = {
  flows: FlowItem[]
};

const WorkflowTipStar = ({...props}) => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M8.61055 5.71028L7.20055 8.53028C7.01055 8.92028 6.50055 9.29028 6.07055 9.37028L3.52055 9.79028C1.89055 10.0603 1.51055 11.2403 2.68055 12.4203L4.67055 14.4103C5.00055 14.7403 5.19055 15.3903 5.08055 15.8603L4.51055 18.3203C4.06055 20.2603 5.10055 21.0203 6.81055 20.0003L9.20055 18.5803C9.63055 18.3203 10.3505 18.3203 10.7805 18.5803L13.1705 20.0003C14.8805 21.0103 15.9205 20.2603 15.4705 18.3203L14.9005 15.8603C14.8105 15.3803 15.0005 14.7303 15.3305 14.4003L17.3205 12.4103C18.4905 11.2403 18.1105 10.0603 16.4805 9.78028L13.9305 9.36028C13.5005 9.29028 12.9905 8.91028 12.8005 8.52028L11.3905 5.70028C10.6205 4.18028 9.38055 4.18028 8.61055 5.71028Z"
      fill="url(#paint0_linear_880_16768)"/>
    <path
      d="M16 6.25H22C22.41 6.25 22.75 5.91 22.75 5.5C22.75 5.09 22.41 4.75 22 4.75H16C15.59 4.75 15.25 5.09 15.25 5.5C15.25 5.91 15.59 6.25 16 6.25Z"
      fill="url(#paint1_linear_880_16768)"/>
    <path
      d="M19 20.25H22C22.41 20.25 22.75 19.91 22.75 19.5C22.75 19.09 22.41 18.75 22 18.75H19C18.59 18.75 18.25 19.09 18.25 19.5C18.25 19.91 18.59 20.25 19 20.25Z"
      fill="url(#paint2_linear_880_16768)"/>
    <path
      d="M21 13.25H22C22.41 13.25 22.75 12.91 22.75 12.5C22.75 12.09 22.41 11.75 22 11.75H21C20.59 11.75 20.25 12.09 20.25 12.5C20.25 12.91 20.59 13.25 21 13.25Z"
      fill="url(#paint3_linear_880_16768)"/>
    <defs>
      <linearGradient id="paint0_linear_880_16768" x1="18" y1="18" x2="2" y2="9" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5555FF"/>
        <stop offset="1" stopColor="#F3A2CF"/>
      </linearGradient>
      <linearGradient id="paint1_linear_880_16768" x1="15.25" y1="5.49773" x2="31" y2="5.49773"
                      gradientUnits="userSpaceOnUse">
        <stop stopColor="#5555FF"/>
        <stop offset="1" stopColor="#F3A2CF"/>
      </linearGradient>
      <linearGradient id="paint2_linear_880_16768" x1="18" y1="19.5" x2="21.1521" y2="14.854"
                      gradientUnits="userSpaceOnUse">
        <stop stop-color="#5555FF"/>
        <stop offset="1" stop-color="#F3A2CF"/>
      </linearGradient>
      <linearGradient id="paint3_linear_880_16768" x1="20.3593" y1="13.1928" x2="24.7484" y2="10.4201"
                      gradientUnits="userSpaceOnUse">
        <stop stop-color="#5555FF"/>
        <stop offset="1" stopColor="#F3A2CF"/>
      </linearGradient>
    </defs>
  </svg>
)

const Workflow = ({flows}: TWorkflowProps) => {
  return (
    <div className={styles.flows}>
      {flows.map((step) => {
        return (
          <div className={styles.flex} key={step.key} onClick={step.onClick}>
            {step.isCurrent && (
              <div className={styles.flowsLocation}>
                <IconLocation/>
                <span>You are here</span>
              </div>
            )}
            {/*{!step.isCurrent && step.isCompleted && (
              <div className={styles.flowsLocationTick}>
                <IconLocationTick/>
              </div>
            )}*/}
            {!step.isCurrent && !step.isCompleted && step.tip && (
              <div className={styles.tip}>
                <WorkflowTipStar />
                <span>{step.tip}</span>
              </div>
            )}
            <div
              className={`${styles.flowsItem} ${step.isCurrent ? styles.flowsItemActive : ''} ${step.isCompleted ? styles.flowsItemSuccess : ''} ${step.onClick ? styles.flowsItemClickable : ''}`}>
              <div
                className={`${styles.flowsHeader} ${step.isCurrent ? styles.flowsHeaderActive : ''} ${step.isCompleted ? styles.flowsHeaderSuccess : ''}`}>
                {step.icon}
                <span>{step.label}</span>
              </div>
              {step.children}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Workflow;
