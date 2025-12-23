import { useCallback, useContext, useMemo, useState } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { TProps } from "../project/useProjectsHook";
import { useAuth } from "@/providers/AuthProvider";
import { MqttContext } from "@/providers/MqttProvider";
import { randomString } from "@/utils/random";
import { useNavigate } from "react-router-dom";
import useDebouncedEffect from "../useDebouncedEffect";

export type TNotification = {
  id: number;
  content: string;
  is_read: boolean;
  link: string;
  time: string;
};

export const useNotifications = (
  props: TProps = {
    page: 1,
    pageSize: 10,
  }
) => {
  const api = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(props.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.pageSize ?? 10);
  const [hasNew, setHasNew] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [refresh, setRefresh] = useState("");
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const mqtt = useContext(MqttContext);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);

    const response: TApiCallResult = api.call("notifications", {
      query: new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      }),
    });

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) return;
        const data = await res.json();
        setNotifications(data?.results ?? []);
        setNotificationsCount(data?.count ?? 0);
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while get list notification";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
          setError(msg);
        }

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useDebouncedEffect(() => {
    if (page === 1) {
      fetchData();
    }
  }, [page, fetchData]);

  useDebouncedEffect(() => {
    setPage(1);
    fetchData();
    setHasNew(false);

    if (!user) {
      return;
    }

    const topic = "user/" + user.id + "/notification";
    mqtt.subscribe(topic);

    const leave = mqtt.onMessage(topic, () => {
      setHasNew(true);
    });

    return () => {
      mqtt.unsubscribe(topic);
      leave();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, mqtt]);

  const markAsRead = useCallback(
    (id: number) => {
      api
        .call("markNotifications", {
          body: {
            action: "mark_read",
            id,
          },
        })
        .promise.then(() => {
          setNotifications(
            notifications.map((n) => {
              if (n.id === id) {
                return { ...n, is_read: true };
              }

              return n;
            })
          );
        });
    },
    [api, notifications]
  );

  const markAsReadMulti = useCallback(
    () => {
      const unreadItems = notifications.filter(n => !n.is_read);
      unreadItems.forEach(item => {
        api.call("markNotifications", {
          body: {
            action: "mark_read",
            id: item.id,
          }
        })
        .promise.then(() => {
          setNotifications(
            notifications.map((n) => ({...n, is_read: true}))
          );
        });
      })
    },
    [api, notifications]
  );

  const reload = useCallback(() => {
    setRefresh(randomString());
  }, []);

  const loadMore = useCallback(() => {
    setLoading(true);
    api
      .call("notifications", {
        query: new URLSearchParams({
          page: (page + 1).toString(),
          page_size: pageSize.toString(),
        }),
      })
      .promise.then(async (res) => {
        const data = await res.json();
        setNotifications([...notifications, ...(data?.results ?? [])]);
        setNotificationsCount(data?.count ?? 0);
        setPage(page + 1);
      })
      .finally(() => setLoading(false));
  }, [
    api,
    page,
    pageSize,
    notifications
  ]);

  const handleClickNotification = useCallback(
    (notification: TNotification) => {
      if (!notification.is_read) {
        markAsRead(notification.id);
      }

      if (notification.link) {
        navigate(notification.link);
      }
    },
    [navigate, markAsRead]
  );

  return useMemo(() => {
    return {
      loading,
      error,
      notifications,
      page,
      pageSize,
      hasNew,
      notificationsCount,
      setPage,
      setPageSize,
      reload,
      loadMore,
      handleClickNotification,
      markAsReadMulti,
    };
  }, [
    loading,
    error,
    notifications,
    page,
    pageSize,
    hasNew,
    notificationsCount,
    setPage,
    setPageSize,
    reload,
    loadMore,
    handleClickNotification,
    markAsReadMulti,
  ]);
};
