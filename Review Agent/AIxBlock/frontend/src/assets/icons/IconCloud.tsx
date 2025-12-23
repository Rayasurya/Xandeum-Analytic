const IconCloud = ({ width = 38, height = 39, ...props }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_4023_27464)">
        <path
          d="M16.315 8.36732C15.7483 5.49232 13.2233 3.33398 10.19 3.33398C7.78167 3.33398 5.69 4.70065 4.64834 6.70065C2.14 6.96732 0.190002 9.09232 0.190002 11.6673C0.190002 14.4257 2.43167 16.6673 5.19 16.6673H16.0233C18.3233 16.6673 20.19 14.8007 20.19 12.5007C20.19 10.3007 18.4817 8.51732 16.315 8.36732Z"
          fill="#40405B"
        />
      </g>
      <defs>
        <clipPath id="clip0_4023_27464">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.190002)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconCloud;
