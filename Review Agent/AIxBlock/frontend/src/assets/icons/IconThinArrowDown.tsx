import { TSvg } from "./IconClear";

const IconThinArrowDown: React.FC<TSvg> = ({
  width = 21,
  height = 20,
  ...props
}) => {
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
        d="M14.015 7.1582L10.19 10.9749L6.365 7.1582L5.19 8.3332L10.19 13.3332L15.19 8.3332L14.015 7.1582Z"
        fill="#40405B"
      />
    </svg>
  );
};

export default IconThinArrowDown;
