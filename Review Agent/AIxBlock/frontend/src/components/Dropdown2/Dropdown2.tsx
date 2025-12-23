import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./Dropdown2.scss";
import { IconPolygon, IconThinArrowDown } from "@/assets/icons/Index";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {highestZIndex} from "@/utils/zIndex";
import { usePopper } from "react-popper";
import {Placement} from "@popperjs/core";

type TDropdownProps = {
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  arrow?: boolean;
  className?: string;
  clickToClose?: boolean;
  placement?: Placement;
  style?: CSSProperties;
};

const Dropdown2 = (props: TDropdownProps) => {
  const {
    label,
    children,
    icon,
    iconPosition = "right",
    className,
    arrow = false,
    placement = "bottom-start",
    style,
  } = props;
  const [isShowDropdown, setShowDropdown] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);
  const eleRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dlRef = useRef<HTMLDivElement | null>(null);
  const MAX_HEIGHT_DROPDOWN = 400;
  const { styles, attributes, forceUpdate } = usePopper(dropdownRef.current, dlRef.current, {
    modifiers: [{ options: { element: triggerRef.current } }],
    strategy: "fixed",
    placement,
  });

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
      className={`dropdown2-wrapper ${className ? className : ""}`}
      ref={dropdownRef}
    >
      <div
        ref={eleRef}
        className={`dropdown2-label ${isShowDropdown ? "show" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          forceUpdate?.();
          setShowDropdown(!isShowDropdown);
        }}
      >
        {iconPosition === "left" && icon}
        {label && <span className="dropdown2-label__text">{label}</span>}
        <span className="dropdown2-label__icon" ref={triggerRef}>
            {icon && iconPosition === "right" ? (
              icon
            ) : (
              <IconThinArrowDown/>
            )}
        </span>
      </div>
      {isShowDropdown && (
        <div
          className="dropdown2-list"
          ref={dlRef}
          style={
            typeof style === "object" && Object.hasOwn(style, "zIndex")
              ? {...style, ...styles.popper}
              : {...style, ...styles.popper, zIndex: highestZIndex() + 1}
          }
          {...attributes.popper}
        >
          {arrow && (
            <div className={`dropdown2-icon__arrow ${placement}`}>
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

export default Dropdown2;
