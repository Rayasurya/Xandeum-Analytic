import "./index.scss";

export const STEP = {
  FILL_IP: "1",
  INSTALL_SH: "2",
  PRICING: "3",
  AVAILABILITY: "4",
};

type ComputesSupplierStepProps = {
  step: string;
};

const ComputesSupplierStep = (props: ComputesSupplierStepProps) => {
  const { step } = props;
  const { FILL_IP, INSTALL_SH, PRICING, AVAILABILITY } = STEP;
  return (
    <div className="computes-step">
      <div
        className={`computes-step-item ${
          step === FILL_IP ? "active" : "filled"
        }`}
      >
        <label className="customcb">
          Fill your IP Port
          <input checked type="checkbox" />
          <span className="checkmark"></span>
        </label>
      </div>
      <div
        className={`computes-step-item ${
          step === INSTALL_SH ? "active" : step === FILL_IP ? "" : "filled"
        }`}
      >
        <label className="customcb">
          Verification
          <input checked={step !== FILL_IP} type="checkbox" />
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
