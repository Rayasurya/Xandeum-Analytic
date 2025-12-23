import React, { createContext, PropsWithChildren, useCallback, useContext, useRef } from "react";
import { TApiCallResult, useApi } from "./ApiProvider";
import { infoDialog } from "../components/Dialog";
import { formatDateTime } from "../utils/formatDate";

export type TNotificationProvider = {
  playSound: () => void;
  showComputeNotifications: (id: number, onShown?: (list: INotification[]) => Promise<void>) => Promise<void>;
  markNotificationAsRead: (id: number) => TApiCallResult;
}

export interface INotification {
  id: number;
  content: string;
  link: string | null;
  is_read: boolean;
  time: string; // Consider using Date if you plan to manipulate date/time values
  detail: string;
  deleted_at: string | null;
  type: string;
  status: 'info' | 'warning' | 'error'; // Adjust the possible values based on your requirements
  history_id: number;
}

const NotificationProviderContext = createContext<TNotificationProvider>({
  playSound: () => {},
  showComputeNotifications: async () => void 0,
  markNotificationAsRead: () => ({
    controller: new AbortController(),
    promise: new Promise(resolve => {}),
  }),
});

export default function NotificationProvider({children}: PropsWithChildren) {
  const audioRef = useRef(new Audio("/static/notification.mp3"));
  const {call} = useApi();

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, []);

  const showComputeNotifications = useCallback(async (id: number, onShown?: (list: INotification[]) => Promise<void>) => {
    let listNotification = [] as INotification[];

    const response: TApiCallResult = call("userNotification", {
      params: {
        history_id: id.toString(),
      },
    });

    const res = await response.promise;

    if (response.controller.signal.aborted) return;

    if (res.ok) {
      const data = await res.json();
      listNotification = data.results;
    } else {
      throw new Error(`Failed to fetch data. Status: ${res.status}`);
    }

    const generateMessage = () => (
      <div className="msg-notification">
        {listNotification.map((notification: INotification, idx) => (
          <>
            <div className="notification-item" key={"notification-" + idx + "-" + notification.id}>
              <div
                key={notification.id}
                className={`msg-${notification.status.toLowerCase()}`}
              >
                {notification.content}
              </div>
              <div className="notification-item-date">{formatDateTime(notification.time)}</div>
            </div>
          </>
        ))}
      </div>
    );

    infoDialog({
      title: `Compute #${id} - Notifications`,
      message: generateMessage,
    });

    onShown?.(listNotification);
  }, [call]);

  const markNotificationAsRead = useCallback((id: number) => {
    return call("markNotifications", {
      body: {
        action: "mark_read",
        id,
      },
    });
  }, [call]);

  if (window.APP_SETTINGS.debug) {
    // @ts-ignore
    window.debugNotificationSound = playSound;
  }

  return (
    <NotificationProviderContext.Provider value={{
      playSound,
      showComputeNotifications,
      markNotificationAsRead,
    }}>
      {children}
    </NotificationProviderContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationProviderContext);
}
