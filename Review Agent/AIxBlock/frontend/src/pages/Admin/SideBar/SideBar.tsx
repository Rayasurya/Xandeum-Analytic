import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideBar.scss";

interface MenuItem {
  to: string;
  label: string;
  children?: MenuItem[];
  activeChecker?: (path: string) => boolean;
}

const Sidebar: React.FC = () => {
  const menuItems: MenuItem[] = [
    {
      to: "/admin/organization?page=1",
      label: "Organizations",
      activeChecker: (path: string) => {
        return path.startsWith("/admin/organization");
      },
    },
    { to: "/admin/user", label: "Users" },
    {
      to: "/admin/template?page=1",
      label: "Templates",
      activeChecker: (path: string) => {
        return path.startsWith("/admin/template");
      },
    },
    {
      to: "/admin/compute",
      label: "Compute",
      children: [
        { to: "/admin/compute/catalog", label: "Catalog" },
        { to: "/admin/compute/computes", label: "Computes" },
      ],
    },
    {
      to: "/admin/model",
      label: "Model",
      children: [
        { to: "/admin/model/catalog", label: "Catalog" },
        { to: "/admin/model/models", label: "Models" },
        { to: "/admin/model/tasks", label: "Model Tasks" },
      ],
    },
    {
      to: "/admin/rewards",
      label: "Rewards",
      children: [
        { to: "/admin/rewards/actions", label: "Actions" },
        { to: "/admin/rewards/history", label: "History" },
      ],
    },
    { to: "/admin/oauth", label: "OAuth Applications" },
    { to: "/admin/activity", label: "Activity Logs" },
    { to: "/admin/crypto-payment", label: "Crypto Payments" },
    { to: "/admin/orders", label: "Orders" },
    // {
    //   to: "/admin/subscription",
    //   label: "Subscription",
    //   children: [
    //     { to: "/admin/subscription/plan", label: "Plan" },
    //     { to: "/admin/subscription/subscription", label: "Subscription" },
    //   ],
    // },
    // {
    //   to: "/admin/tutorial",
    //   label: "Tutorial",
    //   activeChecker: (path: string) => {
    //     return path.startsWith("/admin/tutorial");
    //   },
    // },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (to: string) => {
    navigate(to);

    setTimeout(() => {
      document.querySelector(".layout-user__content")?.scrollTo({top: 0, behavior: "smooth"});
    }, 100);
  };

  return (
    <div className="c-admin-sidebar">
      <ul className="c-admin-sidebar__menu">
        {menuItems.map((item, index) => (
          <li
            className={
              (
                item.activeChecker
                  ? item.activeChecker(location.pathname)
                  : item.to === location.pathname
              )
                ? "c-admin-sidebar__menu-item active"
                : "c-admin-sidebar__menu-item"
            }
            key={index}
            onClick={() => !item.children && handleItemClick(item.to)}
          >
            {item.label}
            {item.children && (
              <ul className="c-admin-sidebar__submenu">
                {item.children.map((child, childIndex) => (
                  <li
                    className={
                      child.to === location.pathname
                        ? "c-admin-sidebar__submenu-item active"
                        : "c-admin-sidebar__submenu-item"
                    }
                    key={childIndex}
                    onClick={() => handleItemClick(child.to)}
                  >
                    {child.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
