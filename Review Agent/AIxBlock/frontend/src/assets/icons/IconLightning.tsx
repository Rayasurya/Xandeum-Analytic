import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconLightning: React.FC<TSvg> = ({
  width = 18,
  height = 18,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.25 11.25H4.5L9.75 0.75V6.75H13.5L8.25 17.25V11.25Z"
        fill="#F59E0B"
      />
    </svg>
  );
};

export default IconLightning;
