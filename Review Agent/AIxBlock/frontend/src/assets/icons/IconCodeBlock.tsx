import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconCodeBlock: React.FC<TSvg> = ({
  width = 12,
  height = 12,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      {...props}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6254 6L9.00043 8.625L8.47168 8.09625L10.5642 6L8.47168 3.90375L9.00043 3.375L11.6254 6Z"
        fill="#D1D5DB"
      />
      <path
        d="M0.375 6L3 3.375L3.52875 3.90375L1.43625 6L3.52875 8.09625L3 8.625L0.375 6Z"
        fill="#D1D5DB"
      />
      <path
        d="M4.65723 9.5565L6.61473 2.25L7.33923 2.44425L5.38135 9.75L4.65723 9.5565Z"
        fill="#D1D5DB"
      />
    </svg>
  );
};

export default IconCodeBlock;
