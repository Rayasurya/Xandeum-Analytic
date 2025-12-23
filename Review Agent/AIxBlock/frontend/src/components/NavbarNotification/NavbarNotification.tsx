import React, { useEffect, useState } from "react";
import { formatDateTime } from "@/utils/formatDate";
import { TNotification, useNotifications } from "@/hooks/notice/useNotification";
import Modal from "../Modal/Modal";
import "./NavbarNotification.scss";

type TNotificaitonProps = {
  setHasNew: (hasNew: boolean) => void;
  setUnreadCount: (unreadCount: number) => void;
  setIsShowListNotification: (isShowMenu: boolean) => void;
};

const MemoizedNavbarNotification: React.FC<TNotificaitonProps> = (props) => {
  const { setHasNew, setUnreadCount, setIsShowListNotification } = props;
  const notificationsHook = useNotifications();
  const {
    notifications,
    loading,
    hasNew,
    notificationsCount,
    error,
    handleClickNotification,
    reload,
    loadMore,
    markAsReadMulti,
  } = notificationsHook;
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setHasNew(hasNew);
  }, [hasNew, setHasNew]);

  const hasUnreadNotification = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    setUnreadCount(hasUnreadNotification);
  }, [hasUnreadNotification, notifications, setUnreadCount]);

  const ItemNotification = (item: TNotification) => (
    <li
      key={item.id}
      className={`c-navbar__notification-item ${item.is_read ? '' : 'un-read'}`}
      onClick={() => {
        handleClickNotification(item);
        setIsShowListNotification(false);
        openModal && setOpenModal(false);
      }}
    >
      <div className="c-navbar__notification-item-title">{item.content}</div>
      <div className="c-navbar__notification-item-day">
        {formatDateTime(item.time)}
      </div>
    </li>
  );

  return (
    <>
      {hasNew && (
        <li className="c-navbar__notification-item highlight" onClick={reload}>
          You have new notification. Click to reload this list.
        </li>
      )}
      {hasUnreadNotification > 0 && (
        <li
          className="c-navbar__notification-item highlight"
          onClick={markAsReadMulti}
        >
          Mark as read these notifications
        </li>
      )}
      {error && <li className="c-navbar__notification-item highlight">{error}</li>}
      {loading ? (
        <li className="c-navbar__notification-item">Loading...</li>
      ) : (
        notifications.map(ItemNotification)
      )}
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title="Notifications"
        className="c-navbar__notification-modal"
      >
        <ul>
          {notifications.map(ItemNotification)}
        </ul>
        {notificationsCount > 0 &&
          notificationsCount > notifications.length && (
            <button
              className="c-navbar__notification-load-more"
              onClick={loadMore}
            >
              Load more...
            </button>
          )}
      </Modal>
      <li
        className="c-navbar__notification-show-all"
        onClick={() => setOpenModal(true)}
      >
        Show all notifications
      </li>
    </>
  );
};

const NavbarNotification = React.memo(MemoizedNavbarNotification);

export default NavbarNotification;
