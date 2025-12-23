import React, {useCallback} from "react";
import mqtt, {MqttClient} from "mqtt";
import {useLoader} from "./LoaderProvider";

export type TMqttProvider = {
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
    publish: (topic: string, msg: string) => void;
    onMessage: (topic: string, cb: (msg: object) => void) => VoidFunction;
    subscribeProject: (projectId: number) => void;
    unsubscribeProject: (projectId: number) => void;
    publishProject: (projectId: number, msg: string) => void;
    onProjectMessage: (projectId: number, cb: (msg: object) => void) => VoidFunction;
    subscribeTask: (taskID: number) => void;
    unsubscribeTask: (taskID: number) => void;
    publishTask: (taskID: number, msg: string) => void;
    onTaskMessage: (taskID: number, cb: (msg: object) => void) => VoidFunction;
    instanceId: string;
}

export const MqttContext = React.createContext<TMqttProvider>({
  subscribe: () => void 0,
  unsubscribe: () => void 0,
  publish: () => void 0,
  onMessage: () => () => void 0,
  subscribeProject: () => void 0,
  unsubscribeProject: () => void 0,
  publishProject: () => void 0,
  onProjectMessage: () => () => void 0,
  subscribeTask: () => void 0,
  unsubscribeTask: () => void 0,
  publishTask: () => void 0,
  onTaskMessage: () => () => void 0,
  instanceId: "",
});

export default function MqttProvider(props: React.PropsWithChildren) {
  const [client, setClient] = React.useState<MqttClient | null>(null);
  const [initialized, setInitialized] = React.useState(false);
  const {createLoader} = useLoader();
  const [state] = React.useState<{
    instanceId: string,
    onMessageCallbacks: {[k: string]: {id: string, callback: (msg: object) => void}[]}
    topics: string[],
  }>({
    instanceId: Math.random().toString().substring(2),
    onMessageCallbacks: {},
    topics: [],
  });

  const subscribe = useCallback((topic: string) => {
    if (state.topics.indexOf(topic) !== -1) return;

    function doSubscribe() {
      client?.subscribe(topic, function(e) {
        if (e) {
          window.APP_SETTINGS.debug && console.error(e);
        } else {
          state.topics.push(topic);
          window.APP_SETTINGS.debug && console.log("MQTT subscribed topic " + topic);
        }
      });
    }

    if (client?.connected) {
      doSubscribe();
    } else {
      client?.on("connect", () => doSubscribe());
    }
  }, [client, state]);

  const unsubscribe = useCallback((topic: string) => {
    if (state.topics.indexOf(topic) !== -1) return;
    client?.unsubscribe(topic);
    state.topics = state.topics.filter(t => t !== topic);
    window.APP_SETTINGS.debug && console.log("MQTT unsubscribed topic " + topic);
  }, [client, state]);

  const publish = useCallback((topic: string, msg: string) => {
    if (!client || !client.connected || client.disconnecting || client.disconnected) return;
    client.publish(topic, msg, {qos: 2});
  }, [client]);

  const onMessage = useCallback((topic: string, cb: (msg: object) => void) => {
    const item = {
      id: "_" + Math.random().toString().substring(2),
      callback: cb,
    };

    if (state.onMessageCallbacks[topic]) {
      state.onMessageCallbacks[topic].push(item);
    } else {
      state.onMessageCallbacks[topic] = [item];
    }


    return () => {
      state.onMessageCallbacks[topic] = state.onMessageCallbacks[topic].filter(c => c.id !== item.id);
    };
  }, [state]);

  const subscribeProject = useCallback((projectId: number) => {
    subscribe("project/" + projectId);
  }, [subscribe]);

  const unsubscribeProject = useCallback((projectId: number) => {
    unsubscribe("project/" + projectId);
  }, [unsubscribe]);

  const publishProject = useCallback((projectId: number, msg: string) => {
    publish("project/" + projectId, msg);
  }, [publish]);

  const onProjectMessage = useCallback((projectId: number, callback: (msg: object) => void) => {
    subscribeProject(projectId);
    return onMessage("project/" + projectId, callback);
  }, [onMessage, subscribeProject]);

  const subscribeTask = useCallback((taskID: number) => {
    subscribe("task/" + taskID);
  }, [subscribe]);

  const unsubscribeTask = useCallback((taskID: number) => {
    unsubscribe("task/" + taskID);
  }, [unsubscribe]);

  const publishTask = useCallback((taskID: number, msg: string) => {
    publish("task/" + taskID, msg);
  }, [publish]);

  const onTaskMessage = useCallback((taskID: number, callback: (msg: object) => void) => {
    subscribeTask(taskID);
    return onMessage("task/" + taskID, callback);
  }, [onMessage, subscribeTask]);

  // function terminateClient() {
  //   client?.end();
  // }

  React.useEffect(() => {
    if (!client) return;

    client.on("connect", () => {
      window.APP_SETTINGS.debug && console.log("MQTT connected");
    });

    client.on("close", () => {
      window.APP_SETTINGS.debug && console.log("MQTT closed");
    });

    client.on("offline", () => {
      window.APP_SETTINGS.debug && console.log("MQTT offline");
    });

    client.on("error", e => {
      window.APP_SETTINGS.debug && console.error("MQTT error", e);
    });

    client.on("message", (t, msg) => {
      if (!state.onMessageCallbacks[t] || state.onMessageCallbacks[t].length === 0) return;
      let msgObj = {}

      try {
        msgObj = JSON.parse(msg.toString())
      } catch (e) {
        window.APP_SETTINGS.debug && console.error(e);
      }

      for (let i = 0; i < state.onMessageCallbacks[t].length; i++) {
        state.onMessageCallbacks[t][i].callback(msgObj);
      }
    });

    return () => {
      client.end();
    }
  }, [client, state.onMessageCallbacks]);

  React.useEffect(() => {
    const closeLoader = createLoader("Connecting to messages server...");
    const isSecure = window.location.protocol === "https:";
    const server = window.APP_SETTINGS.mqtt_server ?? "test.mosquitto.org";
    const port = window.APP_SETTINGS.mqtt_port ?? "8080";
    const portTls = window.APP_SETTINGS.mqtt_port_tls ?? "8081";
    const client = mqtt.connect({
      connectTimeout: 5 * 1000,
      reconnectPeriod: 5 * 1000,
      keepalive: 5,
      protocol: isSecure ? "wss" : "ws",
      host: server,
      hostname: server,
      port: isSecure ? portTls : port,
      rejectUnauthorized: false,
      clientId: 'mqttjs_' + Math.random().toString(16).substring(2, 8),
      clean: false,
    });
    setClient(client);
    setInitialized(true);
    closeLoader();

    if (window.APP_SETTINGS.debug) {
      // @ts-ignore
      window.mqtt = client;
    }

    return () => {
      client.end();
    };
  }, [createLoader]);

  if (!initialized) {
    return <>"Connecting to MQTT..."</>;
  }

  return (
    <MqttContext.Provider value={{
      subscribe,
      unsubscribe,
      publish,
      onMessage,
      subscribeProject,
      unsubscribeProject,
      publishProject,
      onProjectMessage,
      subscribeTask,
      unsubscribeTask,
      publishTask,
      onTaskMessage,
      instanceId: state.instanceId,
    }}>
      {props.children}
    </MqttContext.Provider>
  );
};

export function useMqtt(): TMqttProvider {
  return React.useContext(MqttContext);
}
