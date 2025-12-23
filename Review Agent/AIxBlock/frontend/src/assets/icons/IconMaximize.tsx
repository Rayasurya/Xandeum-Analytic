import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconMaximize: React.FC<TSvg> = ({
  width = 13,
  height = 12,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9 6H9.75V3H6.75V3.75H9V6Z" fill="#6B7280" />
      <path d="M3.75 9H6.75V8.25H4.5V6H3.75V9Z" fill="#6B7280" />
      <path
        d="M10.5 10.5H3C2.80115 10.4998 2.6105 10.4207 2.46989 10.2801C2.32928 10.1395 2.2502 9.94885 2.25 9.75V2.25C2.2502 2.05115 2.32928 1.8605 2.46989 1.71989C2.6105 1.57928 2.80115 1.5002 3 1.5H10.5C10.6989 1.5002 10.8895 1.57928 11.0301 1.71989C11.1707 1.8605 11.2498 2.05115 11.25 2.25V9.75C11.2498 9.94885 11.1707 10.1395 11.0301 10.2801C10.8895 10.4207 10.6989 10.4998 10.5 10.5ZM3 2.25V9.75H10.5004L10.5 2.25H3Z"
        fill="#6B7280"
      />
    </svg>
  );
};

export default IconMaximize;
