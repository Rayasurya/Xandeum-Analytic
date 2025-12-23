import React from "react";

export type TSvg = {
  width?: number;
  height?: number;
};

const IconDeActive: React.FC<TSvg> = ({
  width = 20,
  height = 21,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.75 8.25L12.25 12.75M12.25 8.25L7.75 12.75M19 10.5C19 11.6819 18.7672 12.8522 18.3149 13.9442C17.8626 15.0361 17.1997 16.0282 16.364 16.864C15.5282 17.6997 14.5361 18.3626 13.4442 18.8149C12.3522 19.2672 11.1819 19.5 10 19.5C8.8181 19.5 7.64778 19.2672 6.55585 18.8149C5.46392 18.3626 4.47177 17.6997 3.63604 16.864C2.80031 16.0282 2.13738 15.0361 1.68508 13.9442C1.23279 12.8522 1 11.6819 1 10.5C1 8.11305 1.94821 5.82387 3.63604 4.13604C5.32387 2.44821 7.61305 1.5 10 1.5C12.3869 1.5 14.6761 2.44821 16.364 4.13604C18.0518 5.82387 19 8.11305 19 10.5Z"
        stroke="#ED2E7E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconDeActive;
