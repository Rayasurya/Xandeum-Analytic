import { ReactNode } from "react";
import "./Actions.scss";

export type TFormActions = {
  children?: ReactNode;
  className?: string;
};

const FormActions = (props: TFormActions) => {
  const { children, className } = props;
  return (
    <div className={`c-form__actions ${className ? className : ""}`}>
      {children}
    </div>
  );
};

export default FormActions;
