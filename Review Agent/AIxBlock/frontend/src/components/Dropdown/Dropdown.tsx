import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./Dropdown.scss";
import { /*IconArrowDown,*/ IconPolygon, IconThinArrowDown } from "@/assets/icons/Index";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {highestZIndex} from "@/utils/zIndex";

type TDropdownProps = {
  label?: string | ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  arrow?: boolean;
  className?: string;
  clickToClose?: boolean;
  placement?: "left" | "right";
  style?: CSSProperties;
};

const Dropdown = (props: TDropdownProps) => {
  const {
    label,
    children,
    icon,
    iconPosition = "right",
    className,
    arrow = false,
    placement = "left",
    style,
  } = props;
  const [isShowDropdown, setShowDropdown] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dlRef = useRef<HTMLDivElement | null>(null);
  const MAX_HEIGHT_DROPDOWN = 400;

  const handleClickOutside = useCallback(() => {
    if (!dropdownRef.current || !isShowDropdown) return false;
    setShowDropdown(false);
  }, [isShowDropdown]);

  useEffect(() => {
    if (dropdownRef.current && isShowDropdown) {
      const dList = dlRef.current;

      if (dList) {
        setHeight(dList.clientHeight);
      }
    }
  }, [isShowDropdown, placement]);

  useOnClickOutside(dropdownRef, handleClickOutside);

  return (
    <div
      className={`dropdown-wrapper ${className ? className : ""}`}
      ref={dropdownRef}
    >
      <div
        className={`dropdown-label ${isShowDropdown ? "show" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!isShowDropdown);
        }}
      >
        {iconPosition === "left" && icon}
        {label && <span className="dropdown-label__text">{label}</span>}
        {icon && iconPosition === "right" ? (
          icon
        ) : (
          <span className="dropdown-label__icon">
            <IconThinArrowDown />
          </span>
        )}
      </div>
      {isShowDropdown && (
        <div
          className="dropdown-list"
          ref={dlRef}
          style={typeof style === "object" && Object.hasOwn(style, "zIndex") ? style : {...style, zIndex: highestZIndex() + 1}}
        >
          {arrow && (
            <div className={`dropdown-icon__arrow ${placement}`}>
              <IconPolygon />
            </div>
          )}
          <div
            className={`${
              height >= MAX_HEIGHT_DROPDOWN ? "scrollbar scrollbar-y" : ""
            }`}
          >
            <ul>{children}</ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
