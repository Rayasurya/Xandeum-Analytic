import React, {useState, Suspense, useEffect} from "react";
import Select, {SelectOption} from "../Select/Select";
import {validatePrices} from "@/utils/validators";
import AppLoading from "../AppLoading/AppLoading";
import Modal from "../Modal/Modal";
import Radio from "../Radio/Radio";
import InputBase from "../InputBase/InputBase";
import styles from "./PreferenceModal.module.scss";

export type TAutoProvision = {
  minPrice: string;
  maxPrice: string;
  modelIds: string[];
  type_remove: string;
};

type PreferenceModalFormProps = {
  isOpen: boolean;
  title: string;
  onCancel?: () => void;
  onSubmit?: (data: TAutoProvision) => void;
};

const PreferenceModal = (props: PreferenceModalFormProps) => {
  const {isOpen, title, onCancel, onSubmit} = props;
  const [minPrice, setMinPrice] = useState<string>();
  const [maxPrice, setMaxPrice] = useState<string>();
  const [selectedModels, setSelectedModels] = useState<SelectOption[]>([]);
  const [showAcknowledge, setShowAcknowledge] = useState<boolean>(false);
  const [autoProvisionOption, setAutoProvisionOption] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    minPrice?: string;
    maxPrice?: string;
    selectedModels?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) {
      setMinPrice("");
      setMaxPrice("");
      setSelectedModels([]);
      setErrors({});
      setAutoProvisionOption(null);
      setShowAcknowledge(false)
    }
  }, [isOpen]);

  const onCancelModal = () => {
    onCancel?.();
  };

  const onSubmitModal = () => {
    const errors = {
      minPrice: "",
      maxPrice: "",
      selectedModels: "",
    };
    let isError = false;
    const minPriceValid = validatePrices(Number(minPrice));
    if (!minPriceValid.isValid) {
      isError = true;
      errors.minPrice = minPriceValid.errorMessage ?? "";
    }
    const maxPriceValid = validatePrices(Number(minPrice), Number(maxPrice));
    if (!maxPriceValid.isValid) {
      isError = true;
      errors.maxPrice = maxPriceValid.errorMessage ?? "";
    }
    if (selectedModels.length === 0) {
      isError = true;
      errors.selectedModels = "Card model is required";
    }
    if (isError) {
      setErrors(errors);
      return;
    }
    setShowAcknowledge(true);
  };

  const onNextPress = () => {
    onSubmit?.({
      minPrice: minPrice ?? "",
      maxPrice: maxPrice ?? "",
      modelIds: selectedModels.map((o) => o.value),
      type_remove: autoProvisionOption === 1 ? 'dashboard' : 'market',
    });
  }

  return (
    <Suspense fallback={<AppLoading/>}>
      <Modal
        title={showAcknowledge ? 'How it works' : title}
        className={styles.preferenceModal}
        open={isOpen}
        onCancel={onCancelModal}
        cancelText={"Back"}
        submitText={"Next"}
        onSubmit={showAcknowledge ? onNextPress : onSubmitModal}
      >
        {showAcknowledge ? <>
          <p>1. If your models need more resources, we'll upscale using available computes from your dashboard. If none
            are available, we'll automatically rent additional ones from the marketplace using your deposit balance.</p>
          <p>2. If your models use fewer resources than allocated, we'll scale down and notify you to back up any data
            saved on those computes. Then do you prefer to keep the freed-up computes on your dashboard for other uses
            (note: continued charges apply if rented), or return them to the marketplace for a partial refund?</p>
          <div className={styles.radio}>
            <Radio label="My compute dashboard" checked={autoProvisionOption === 1} onChange={(isChecked) => {
              if (isChecked) {
                setAutoProvisionOption(1)
              }
            }}/>
          </div>
          <div className={styles.radio}>
            <Radio label="Marketplace" checked={autoProvisionOption === 2} onChange={(isChecked) => {
              if (isChecked) {
                setAutoProvisionOption(2)
              }
            }}/>
          </div>
        </> : <>
          <div className={styles.rangeLabel}>Price range</div>
          <div
            className={`${styles.rangeRow} ${(errors.minPrice || errors.maxPrice) && styles.rangeRowError}`}
          >
            <InputBase
              label="From"
              value={minPrice}
              type="number"
              placeholder="$0.0"
              onChange={(e) => setMinPrice(e.target.value)}
              allowClear={false}
              className={styles.inputModal}
            />
            <InputBase
              label="To"
              value={maxPrice}
              type="number"
              placeholder="$0.0"
              onChange={(e) => setMaxPrice(e.target.value)}
              allowClear={false}
            />
          </div>
          {(errors.minPrice || errors.maxPrice) && (
            <div className={styles.rangeError}>
              {errors.minPrice && <span>{errors.minPrice}</span>}
              {errors.maxPrice && errors.maxPrice !== errors.minPrice && (
                <span>{errors.maxPrice}</span>
              )}
            </div>
          )}
          <Select
            label={"Card model"}
            placeholderText={"Select Model"}
            isMultiple={true}
            defaultValue={selectedModels}
            onMultipleChange={(options) => setSelectedModels(options)}
            type="checkbox"
            error={errors.selectedModels}
            data={[
              {
                label: "",
                options: [
                  {
                    label: "NVIDIA",
                    value: "nvdia",
                  },
                  {
                    label: "AMD",
                    value: "amd",
                  },
                  {
                    label: "APPLE",
                    value: "apple",
                  },
                  {
                    label: "INTEL",
                    value: "intel",
                  },
                ],
              },
            ]}
          ></Select>
        </>}
      </Modal>
    </Suspense>
  );
};

export default PreferenceModal;
