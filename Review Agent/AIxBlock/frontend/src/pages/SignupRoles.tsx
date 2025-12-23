import IconArrowLeft from "../assets/icons/IconArrowLeft";
import { ROLES, SIGN_UP } from "./Signup";
import "./Signup.scss";

type SignupRolesProps = {
  role: number;
  onChange: (role: number) => void;
  setPage: (page: typeof SIGN_UP | typeof ROLES) => void;
  onSubmit: () => void;
};

export const ROLE = {
  COMPUTE_SUPPLIER: 1,
  MODEL_DEVELOPER: 2,
  MODEL_SELLER: 3,
  LABELER: 4,
};

const SignupRoles = ({
  role,
  onChange,
  setPage,
  onSubmit,
}: SignupRolesProps) => {
  const { COMPUTE_SUPPLIER, MODEL_DEVELOPER, MODEL_SELLER, LABELER } = ROLE;
  return (
    <div className="sign-up">
      <div className="sign-up-left">
        <div className="sign-up-left-content">
          <img src={require("../assets/images/logo.png")} alt="Logo" />
          <span className="sign-up-left-text">
            Which role aligns most closely with your usage purpose?
          </span>
        </div>
      </div>
      <div className="sign-up-right">
        <div
          className={`sign-up-right-item ${
            role === COMPUTE_SUPPLIER ? "selected" : ""
          }`}
          onClick={() => onChange(COMPUTE_SUPPLIER)}
        >
          1. Compute supplier
        </div>
        <div
          className={`sign-up-right-item ${
            role === MODEL_DEVELOPER ? "selected" : ""
          }`}
          onClick={() => onChange(MODEL_DEVELOPER)}
        >
          2. AI/ML model developer
        </div>
        <div
          className={`sign-up-right-item ${
            role === MODEL_SELLER ? "selected" : ""
          }`}
          onClick={() => onChange(MODEL_SELLER)}
        >
          3. AI/ML model seller
        </div>
        <div
          className={`sign-up-right-item ${
            role === LABELER ? "selected" : ""
          }`}
          onClick={() => onChange(LABELER)}
        >
          4. Labeler
        </div>
        <div className="sign-up-right-btn">
          <button
            className="sign-up-right-btn-back"
            onClick={() => setPage(SIGN_UP)}
          >
            <IconArrowLeft /> Back
          </button>
          <button className="sign-up-right-btn-next" onClick={onSubmit}>
            Next <IconArrowLeft />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupRoles;
