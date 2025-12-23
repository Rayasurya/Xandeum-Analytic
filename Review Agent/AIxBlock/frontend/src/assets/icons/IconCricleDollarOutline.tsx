import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconCricleDollarOutline: React.FC<TSvg> = ({
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
        d="M7.22656 11.9417C7.22656 13.0167 8.05156 13.8834 9.07656 13.8834H11.1682C12.0599 13.8834 12.7849 13.125 12.7849 12.1917C12.7849 11.175 12.3432 10.8167 11.6849 10.5834L8.32656 9.4167C7.66823 9.18337 7.22656 8.82503 7.22656 7.80837C7.22656 6.87503 7.95156 6.1167 8.84323 6.1167H10.9349C11.9599 6.1167 12.7849 6.98337 12.7849 8.05837"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5V15"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.99996 18.3332C14.6023 18.3332 18.3333 14.6022 18.3333 9.99984C18.3333 5.39746 14.6023 1.6665 9.99996 1.6665C5.39759 1.6665 1.66663 5.39746 1.66663 9.99984C1.66663 14.6022 5.39759 18.3332 9.99996 18.3332Z"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconCricleDollarOutline;
