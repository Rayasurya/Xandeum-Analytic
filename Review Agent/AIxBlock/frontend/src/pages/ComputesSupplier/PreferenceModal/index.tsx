import React, { useState, Suspense, useEffect } from "react";
import Modal from "@/components/Modal/Modal";
import "./index.scss";
import InputBase from "@/components/InputBase/InputBase";
import Select, { SelectOption } from "@/components/Select/Select";
import { validatePrices } from "@/utils/validators";
import Radio from "@/components/Radio/Radio";
import AppLoading from "@/components/AppLoading/AppLoading";

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
  const { isOpen, title, onCancel, onSubmit } = props;
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
        className="c-preference-modal"
        open={isOpen}
        onCancel={onCancelModal}
        cancelText={"Back"}
        submitText={"Next"}
        onSubmit={showAcknowledge ? onNextPress : onSubmitModal}
      >
        {showAcknowledge ? <>
          <p>1. If your models need more resources, we'll upscale using available computes from your dashboard. If none are available, we'll automatically rent additional ones from the marketplace using your deposit balance.</p>
          <p>2. If your models use fewer resources than allocated, we'll scale down and notify you to back up any data saved on those computes. Then do you prefer to keep the freed-up computes on your dashboard for other uses (note: continued charges apply if rented), or return them to the marketplace for a partial refund?</p>
          <Radio label="My compute dashboard" checked={autoProvisionOption === 1} onChange={(isChecked) => {
            if (isChecked) {
              setAutoProvisionOption(1)
            }
          }} />
          <Radio label="Marketplace" checked={autoProvisionOption === 2} onChange={(isChecked) => {
            if (isChecked) {
              setAutoProvisionOption(2)
            }
          }} />
        </> : <>
          <div className="c-preference-modal__range-label">Price range</div>
          <div
            className={`c-preference-modal__range-row ${(errors.minPrice || errors.maxPrice) &&
              "c-preference-modal__range-row--error"
              }`}
          >
            <InputBase
              label="From"
              value={minPrice}
              type="number"
              placeholder="$0.0"
              customRightItem={<span>per hour</span>}
              onChange={(e) => setMinPrice(e.target.value)}
              allowClear={false}
            />
            <InputBase
              label="To"
              value={maxPrice}
              type="number"
              placeholder="$0.0"
              customRightItem={<span>per hour</span>}
              onChange={(e) => setMaxPrice(e.target.value)}
              allowClear={false}
            />
          </div>
          {(errors.minPrice || errors.maxPrice) && (
            <div className="c-preference-modal__range-error">
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
