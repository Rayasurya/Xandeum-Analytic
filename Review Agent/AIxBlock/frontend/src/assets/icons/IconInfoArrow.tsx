import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconInfoArrow: React.FC<TSvg> = ({
  width = 20,
  height = 21,
  ...props
}) => {
  return (
    <svg
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.32031 0.25V1H7.04156L0.820312 7.22125L1.34906 7.75L7.57031 1.52875V6.25H8.32031V0.25H2.32031Z"
        fill="black"
      />
    </svg>
  );
};

export default IconInfoArrow;
