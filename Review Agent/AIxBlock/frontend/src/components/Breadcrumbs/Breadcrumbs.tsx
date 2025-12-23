import React from "react";
import { TNavbarBreadcrumb } from "../Navbar/Navbar";
import './Breadcrumbs.scss';

type TBreadcrumbsProps = {
  data: TNavbarBreadcrumb[] | null | undefined;
};

const MemoizedBreadcrumbs: React.FC<TBreadcrumbsProps> = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  return (
    <>
      {data.map((b, i) =>
        i < data.length - 1 ? (
          <li
            className="c-navbar__breadcrumbs-item"
            key={"breadcrumb-" + i}
            onClick={b.onClick}
          >
            {b.label}
          </li>
        ) : (
          <li
            className="c-navbar__breadcrumbs-item last"
            key={"breadcrumb-" + i}
          >
            {b.label}
          </li>
        )
      )}
    </>
  );
};

const Breadcrumbs = React.memo(MemoizedBreadcrumbs);

export default Breadcrumbs;
