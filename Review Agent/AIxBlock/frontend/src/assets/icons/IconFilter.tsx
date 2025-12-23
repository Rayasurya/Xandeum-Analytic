const IconFilter = ({
  width = 25,
  height = 24,
  color = "#40405B",
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.45953 17V19H9.45953V17H3.45953ZM3.45953 5V7H13.4595V5H3.45953ZM13.4595 21V19H21.4595V17H13.4595V15H11.4595V21H13.4595ZM7.45953 9V11H3.45953V13H7.45953V15H9.45953V9H7.45953ZM21.4595 13V11H11.4595V13H21.4595ZM15.4595 9H17.4595V7H21.4595V5H17.4595V3H15.4595V9Z"
        fill={color}
      />
    </svg>
  );
};

export default IconFilter;
