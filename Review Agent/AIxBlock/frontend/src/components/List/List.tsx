import React from "react";
import {IconArrowDown} from "@/assets/icons/Index";
import "./List.scss";

export default function List(props: {
  activeIndex?: number,
  className?: string,
  isCollapsible?: boolean,
  isExpanded?: boolean,
  items: {label: string, onClick?: () => void}[],
  title?: string,
  onClick?: () => void
}) {
  const [expand, setExpand] = React.useState(props.isExpanded ?? true);
  const listOnClick = props.onClick;

  const classes = React.useMemo(() => {
    const list = [props.className ?? "", "c-list"];

    if (expand) {
      list.push("c-list--expand");
    }

    if (props.isCollapsible) {
      list.push("c-list--collapsible");
    }

    return list.join(" ");
  }, [props.className, props.isCollapsible, expand]);

  const title = React.useMemo(() => {
    if (!props.title) {
      return null;
    }

    let icon = null;

    if (props.isCollapsible) {
      icon = <IconArrowDown />;
    }

    return (
      <div className="c-list__title" onClick={() => {
        props.isCollapsible && setExpand(!expand);
        listOnClick && listOnClick();
      }}>
        {props.title}
        {icon}
      </div>
    );
  }, [props.isCollapsible, props.title, listOnClick, expand]);

  const items = React.useMemo(() => {
    return (
      <div className="c-list__items">
        {props.items.map((i, idx) => {
          const classes = ["c-list__item"];

          if (props.activeIndex === idx) {
            classes.push("c-list__item--active");
          }

          return (
            <div
              key={"item-" + idx}
              className={classes.join(" ")}
              onClick={() => i.onClick?.()}
            >
              {i.label}
            </div>
          );
        })}
      </div>
    );
  }, [props.items, props.activeIndex]);

  return (
    <div className={classes}>
      {title}
      {items}
    </div>
  );
}
