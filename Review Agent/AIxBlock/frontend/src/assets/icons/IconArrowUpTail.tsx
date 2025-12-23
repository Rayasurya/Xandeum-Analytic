import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconArrowUpTail: React.FC<TSvg> = ({
  width = 20,
  height = 21,
  ...props
}) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5525 7.1775L9.00001 2.625L4.44751 7.1775"
        stroke="#5050FF"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15.3749V2.75244"
        stroke="#5050FF"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconArrowUpTail;
