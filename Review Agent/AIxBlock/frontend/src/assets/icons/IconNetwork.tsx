import React from "react";

const IconNetwork = ({ width = 20, height = 21, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.63596 16.6673H19.3026V13.334H2.63596V16.6673ZM4.30262 14.1673H5.96929V15.834H4.30262V14.1673ZM2.63596 3.33398V6.66732H19.3026V3.33398H2.63596ZM5.96929 5.83398H4.30262V4.16732H5.96929V5.83398ZM2.63596 11.6673H19.3026V8.33398H2.63596V11.6673ZM4.30262 9.16732H5.96929V10.834H4.30262V9.16732Z"
        fill="#40405B"
      />
    </svg>
  );
};

export default IconNetwork;
