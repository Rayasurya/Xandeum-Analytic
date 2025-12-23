import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconGift: React.FC<TSvg> = ({ width = 16, height = 16, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.3132 6.6665H2.64648V11.9998C2.64648 13.9998 3.31315 14.6665 5.31315 14.6665H10.6465C12.6465 14.6665 13.3132 13.9998 13.3132 11.9998V6.6665Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3332 4.66683V5.3335C14.3332 6.06683 13.9798 6.66683 12.9998 6.66683H2.99984C1.97984 6.66683 1.6665 6.06683 1.6665 5.3335V4.66683C1.6665 3.9335 1.97984 3.3335 2.99984 3.3335H12.9998C13.9798 3.3335 14.3332 3.9335 14.3332 4.66683Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.76018 3.33329H4.08018C3.85352 3.08663 3.86018 2.70663 4.10018 2.46663L5.04685 1.51996C5.29352 1.27329 5.70018 1.27329 5.94685 1.51996L7.76018 3.33329Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9134 3.33329H8.2334L10.0467 1.51996C10.2934 1.27329 10.7001 1.27329 10.9467 1.51996L11.8934 2.46663C12.1334 2.70663 12.1401 3.08663 11.9134 3.33329Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.95996 6.6665V10.0932C5.95996 10.6265 6.54663 10.9398 6.99329 10.6532L7.61996 10.2398C7.84663 10.0932 8.13329 10.0932 8.35329 10.2398L8.94663 10.6398C9.38663 10.9332 9.97996 10.6198 9.97996 10.0865V6.6665H5.95996Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconGift;
