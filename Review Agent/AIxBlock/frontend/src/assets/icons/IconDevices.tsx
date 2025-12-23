import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconDevices: React.FC<TSvg> = ({ width = 16, height = 16, ...props }) => {
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
        d="M4.2935 1.3335H11.7002C14.0735 1.3335 14.6668 1.92683 14.6668 4.2935V8.5135C14.6668 10.8868 14.0735 11.4735 11.7068 11.4735H4.2935C1.92683 11.4802 1.3335 10.8868 1.3335 8.52016V4.2935C1.3335 1.92683 1.92683 1.3335 4.2935 1.3335Z"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.48V14.6666"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.3335 8.6665H14.6668"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14.6665H11"
        stroke="#40405B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconDevices;
