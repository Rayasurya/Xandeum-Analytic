import styles from "./AutoProvision.module.scss";
import React, {useCallback, useMemo, useState} from "react";
import {IconInfoV2} from "@/assets/icons/IconInfoV2";
import Switch from "../Switch/Switch";
import {confirmDialog, infoDialog} from "../Dialog";
import {useAuth} from "@/providers/AuthProvider";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import useUserPortfolio from "@/hooks/user/useUserPortfolio";
import {TOKEN_SYMBOL_DEFAULT} from "@/constants/projectConstants";
import PreferenceModal, {TAutoProvision} from "./PreferenceModal";
import Modal from "../Modal/Modal";
import {Tooltip} from "react-tooltip";
import Topup from "../Topup/Topup";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";

export default function AutoProvision() {
  const {user} = useAuth();
  const {call} = useApi();
  const {balance, refresh: refreshBalance} = useUserPortfolio(TOKEN_SYMBOL_DEFAULT);
  const [autoProvision, setAutoProvision] = useState<boolean>(false);
  const [dataAutoProvision, setDataAutoProvision] = useState<TAutoProvision | undefined>();
  const [isDeposit, setIsDeposit] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [openPreferenceModalOption, setOpenPreferenceModalOption] = useState<{
    isOpen: boolean;
    title: string;
  }>({
    isOpen: false,
    title: "",
  });

  const submitAutoProvision = useCallback(async (data: TAutoProvision) => {
    try {
      if (user?.id) {
        const ar = call("postAutoMergeCard", {
          params: { id: user?.id.toString() },
          body: {
            price_from: data.minPrice,
            price_to: data.maxPrice,
            unit: 'hour',
            model_card: data.modelIds.join(","),
            user_id: user?.id,
            type_remove: data.type_remove,
          }
        });

        setIsProcessing(true);

        ar.promise
          .then(r => {
            if (r.ok) {
              setAutoProvision(true);
              setIsDeposit(false);
              infoDialog({ message: "Congratulations on successfully setting up Auto Provision!" });
            } else {
              confirmDialog({
                message: "An error occurred while setup Auto Provision. Please try again!", onCancel() {
                  setAutoProvision(false);
                  setIsDeposit(false);
                },
                onSubmit() {

                },
              });
            }
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }
    } catch (error) {
      if (error instanceof Error) {
        infoDialog({ message: error.message });
      } else {
        confirmDialog({
          message: "An error occurred while setup Auto Provision. Please try again!", onCancel() {
            setAutoProvision(false);
            setIsDeposit(false);
          },
          onSubmit() {

          }
        });
      }
    }
  }, [call, user?.id]);

  const handleBuy = useCallback(() => {
    if (!dataAutoProvision) {
      return;
    }

    submitAutoProvision(dataAutoProvision);
  }, [submitAutoProvision, dataAutoProvision]);

  const handleSubmitPreferenceModal = (data: TAutoProvision) => {
    setOpenPreferenceModalOption({isOpen: false, title: ""});
    setDataAutoProvision(data);

    if (balance >= 50) {
      setTimeout(() => handleBuy(), 250);
    } else {
      setIsDeposit(true);
    }
  }

  const handleCancelPreferenceModal = () => {
    setAutoProvision(false)
    setOpenPreferenceModalOption({isOpen: false, title: ""});
  }

  const showInfoPreference = (isCustom: boolean) => {
    setOpenPreferenceModalOption({
      isOpen: true,
      title: isCustom ? "Custom Preference:" : "Set default Preference:",
    });
  };

  const handleSwitchAutoProvision = useCallback((isChecked: boolean) => {
    if (isChecked === autoProvision) return;

    if (isChecked) {
      refreshBalance();
      confirmDialog({
        title: "Auto provision",
        message: "Should we auto-rent and configure additional compute from the marketplace when your model needs more computes?",
        onSubmit: () => showInfoPreference(true),
        submitText: "Yes",
        cancelText: "No",
      });
    } else {
      setIsProcessing(true);

      call("deleteComputePreference", {
        params: {"id": (user?.id ?? 0).toString()},
      }).promise
        .then(r => {
          if (r.ok) {
            setAutoProvision(false);
          }
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }

    // if (isChecked) {
    //   confirmDialog({
    //     title: "Compute Preference:",
    //     message: `If you set the default, there is no need to reset it and only need to be set once.\n
		// 		If you set the settings, you can customize the parameters each time you turn it on`,
    //     submitText: "Custom",
    //     cancelText: "Set default",
    //     onSubmit: () => {
    //       showInfoPreference(true)
    //     },
    //     onCancel(ref) {
    //       //define as custom button
    //       if (ref) {
    //         showInfoPreference(false)
    //       } else {
    //         setAutoProvision(false)
    //       }
    //     },
    //   });
    // }
  }, [autoProvision, call, refreshBalance, user?.id]);

  const tooltipId = useMemo(() => "_" + Math.random().toString().substring(2, 8), []);

  useDebouncedEffect(() => {
    let ar: TApiCallResult;

    const getAutoProvision = async () => {
      try {
        if (user?.id) {
          const ar = call("getComputePreference", {
            params: { id: user?.id.toString() },
          });

          ar.promise.then(async res => {
            const jsonData = await res.json();
            if (res.ok) {
              jsonData.id && setAutoProvision(true);
            }
          })
            .catch(e => {
              if (ar.controller.signal.aborted) {
                return;
              }

              if (window.APP_SETTINGS.debug) {
                console.error(e);
              }
            })
        }
      } catch (error) {
        setAutoProvision(false);
      }
    };

    getAutoProvision();

    return () => {
      ar?.controller?.abort("Unmounted");
    }
  }, [user?.id, call]);

  return (
    <>
      <div className={styles.autoProvision}>
        <span id={tooltipId}>
          <IconInfoV2 id={tooltipId} width={12} height={12} />
        </span>
        <Tooltip
          place="top"
          positionStrategy="fixed"
          content="Enable auto-scaling to adjust GPUs/CPUs based on your model's compute needs."
          anchorSelect={"#" + tooltipId}
          style={{maxWidth: 360}}
        />
        <span className={styles.autoProvisionTitle}>Auto Provision</span>
        <Switch
          checked={autoProvision}
          onChange={handleSwitchAutoProvision}
          processing={isProcessing}
        />
      </div>
      <PreferenceModal
        isOpen={openPreferenceModalOption.isOpen}
        title={openPreferenceModalOption.title}
        onCancel={handleCancelPreferenceModal}
        onSubmit={handleSubmitPreferenceModal}
      />
      <Modal
        open={isDeposit}
        onClose={() => setIsDeposit(false)}
      >
        <Topup
          amount={50}
          note="Whenever computing resources are auto-scaled, you will be notified to top up your balance for continued stability."
          onFinish={() => {
            setIsDeposit(false);
            handleBuy();
          }}
        />
      </Modal>
    </>
  );
}
