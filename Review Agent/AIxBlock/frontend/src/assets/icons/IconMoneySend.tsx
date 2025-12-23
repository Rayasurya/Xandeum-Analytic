import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconMoneySend: React.FC<TSvg> = ({
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
        d="M7.91663 11.4585C7.91663 12.2669 8.54164 12.9169 9.3083 12.9169H10.8749C11.5416 12.9169 12.0833 12.3502 12.0833 11.6419C12.0833 10.8835 11.75 10.6085 11.2583 10.4335L8.74996 9.55852C8.25829 9.38352 7.92497 9.11686 7.92497 8.35019C7.92497 7.65019 8.46662 7.0752 9.13329 7.0752H10.7C11.4666 7.0752 12.0916 7.7252 12.0916 8.53353"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.25V13.75"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3333 9.99984C18.3333 14.5998 14.6 18.3332 9.99996 18.3332C5.39996 18.3332 1.66663 14.5998 1.66663 9.99984C1.66663 5.39984 5.39996 1.6665 9.99996 1.6665"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3333 4.99984V1.6665H15"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1666 5.83317L18.3333 1.6665"
        stroke="#292D32"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconMoneySend;
