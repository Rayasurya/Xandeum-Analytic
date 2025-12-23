import "./index.scss";

export const STEP = {
  INSTALL: "1",
  PRICING: "3",
  AVAILABILITY: "4",
};

type ComputesSupplierStepProps = {
  step: string;
};

const ComputesSupplierStep = (props: ComputesSupplierStepProps) => {
  const { step } = props;
  const { INSTALL, PRICING, AVAILABILITY } = STEP;
  return (
    <div className="computes-step">
      <div
        className={`computes-step-item ${
          step === INSTALL ? "active" : "filled"
        }`}
      >
        <label className="customcb">
          Install
          <input checked type="checkbox" />
          <span className="checkmark"></span>
        </label>
      </div>
      <div
        className={`computes-step-item ${
          step === PRICING
            ? "active"
            : step === AVAILABILITY
            ? "filled"
            : ""
        }`}
      >
        <label className="customcb">
          Pricing
          <input
            checked={step === PRICING || step === AVAILABILITY}
            type="checkbox"
          />
          <span className="checkmark"></span>
        </label>
      </div>
      <div
        className={`computes-step-item ${
          step === AVAILABILITY ? "active" : ""
        }`}
      >
        <label className="customcb">
          Availability
          <input checked={step === AVAILABILITY} type="checkbox" />
          <span className="checkmark"></span>
        </label>
      </div>
      <div className="line" />
    </div>
  );
};

export default ComputesSupplierStep;
