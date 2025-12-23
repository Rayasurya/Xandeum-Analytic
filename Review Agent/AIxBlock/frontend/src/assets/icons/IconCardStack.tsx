import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconCardStack: React.FC<TSvg> = ({
  width = 20,
  height = 20,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.66663 10.5083H15.8333"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8333 8.56634V14.5247C15.8083 16.8997 15.1583 17.4997 12.6833 17.4997H4.81665C2.29998 17.4997 1.66663 16.8747 1.66663 14.3913V8.56634C1.66663 6.31634 2.19163 5.59134 4.16663 5.47467C4.36663 5.46634 4.58332 5.45801 4.81665 5.45801H12.6833C15.1999 5.45801 15.8333 6.08301 15.8333 8.56634Z"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3333 5.60833V11.4333C18.3333 13.6833 17.8083 14.4083 15.8333 14.525V8.56666C15.8333 6.08333 15.1999 5.45833 12.6833 5.45833H4.81665C4.58332 5.45833 4.36663 5.46667 4.16663 5.475C4.19163 3.1 4.84165 2.5 7.31665 2.5H15.1833C17.6999 2.5 18.3333 3.125 18.3333 5.60833Z"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.375 14.8418H5.80831"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.59167 14.8418H10.4583"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconCardStack;
