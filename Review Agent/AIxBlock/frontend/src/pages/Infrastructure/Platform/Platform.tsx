import {useInfrastructureProvider} from "../InfrastructureProvider";
import ComputeList from "../Shared/ComputeList";
import styles from "./Platform.module.scss";
// import {useUserLayout} from "@/layouts/UserLayout";
import React from "react";
// import {IconPlus} from "@/assets/icons/Index";
import {useNavigate} from "react-router-dom";
import Button from "@/components/Button/Button";

function EmptyList() {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.emptyList}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 10H10.02M10 34H10.02M6 2H38C40.2091 2 42 3.79086 42 6V14C42 16.2091 40.2091 18 38 18H6C3.79086 18 2 16.2091 2 14V6C2 3.79086 3.79086 2 6 2ZM6 26H38C40.2091 26 42 27.7909 42 30V38C42 40.2091 40.2091 42 38 42H6C3.79086 42 2 40.2091 2 38V30C2 27.7909 3.79086 26 6 26Z"
            stroke="#40405B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        You are using AIxBlock server
      </div>
      <div className={styles.cta}>
        <Button
          type="gradient"
          onClick={() => navigate("/infrastructure/setup-platform")}
        >
          Want to self-host on your server? Click here
        </Button>
      </div>
    </>
  );
}

export default function Platform() {
  const {rentedGpu: {refresh}, selfHostedPlatform} = useInfrastructureProvider();
  // const {setActions, clearActions} = useUserLayout();
  // const navigate = useNavigate();
  //
  // React.useEffect(() => {
  //   setActions([
  //     {
  //       label: "Add compute",
  //       icon: <IconPlus />,
  //       actionType: "primary2",
  //       onClick: () => navigate("/infrastructure/setup-platform"),
  //     },
  //   ]);
  //
  //   return () => clearActions();
  // }, [clearActions, navigate, setActions]);

  return (
    <>
      {
        selfHostedPlatform.length > 0
          ? (
            <div className={styles.container}>
              <ComputeList list={selfHostedPlatform} refresh={refresh}/>
            </div>
          )
          : <EmptyList/>
      }
    </>
  );
}
