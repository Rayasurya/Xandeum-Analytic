import { ReactNode } from "react";
import "./Row.scss";

export type TFormRow = {
  children?: ReactNode;
  className?: string;
  columnCount?: number;
  gap?: number;
};

const FormRow = (props: TFormRow) => {
  const { children, className, columnCount, gap } = props;

  return (
    <div
      className={`c-form__row ${className ? className : ""}`}
      style={{
        gridTemplateColumns: `repeat(${columnCount ? columnCount : 1},1fr)`,
        gap: gap ? gap : "16",
      }}
    >
      {children}
    </div>
  );
};

export default FormRow;
