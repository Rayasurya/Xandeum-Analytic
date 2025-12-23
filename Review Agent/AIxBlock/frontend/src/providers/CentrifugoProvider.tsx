import React, {useCallback} from "react";
import {Centrifuge, Subscription} from "centrifuge";
import {useAuth} from "./AuthProvider";
import useDebouncedEffect from "../hooks/useDebouncedEffect";

export type TCentrifugeProvider = {
    subscribe: (topic: string, noPrefix?: boolean) => void;
    publish: (topic: string, msg: object, noPrefix?: boolean) => void;
    onMessage: (topic: string, cb: (msg: object) => void, noPrefix?: boolean) => VoidFunction;
    publishProject: (projectId: number, msg: object) => void;
    onProjectMessage: (projectId: number, cb: (msg: object) => void) => VoidFunction;
    publishTask: (taskID: number, msg: object) => void;
    onTaskMessage: (taskID: number, cb: (msg: object) => void) => VoidFunction;
    unsubscribe: (topic: string, noPrefix?: boolean) => void;
    isSubscribed: (topic: string, noPrefix?: boolean) => boolean;

}

export const CentrifugeContext = React.createContext<TCentrifugeProvider>({
  subscribe: () => void 0,
  unsubscribe: () => void 0,
  publish: () => void 0,
  onMessage: () => () => void 0,
  publishProject: () => void 0,
  onProjectMessage: () => () => void 0,
  publishTask: () => void 0,
  onTaskMessage: () => () => void 0,
  isSubscribed: () => false,
});

const transports = [
  {transport: 'websocket', endpoint: window.APP_SETTINGS.centrifuge_server}
];

export default function CentrifugeProvider(props: React.PropsWithChildren) {
  const {user} = useAuth();
  const client = React.useRef<Centrifuge>(
    new Centrifuge(transports as any, {token: user?.centrifuge_token ?? ""})
  );
  const unmounted = React.useRef<boolean>();
  const state = React.useRef<{
    instanceId: string,
    onMessageCallbacks: {[k: string]: {id: string, callback: (msg: object) => void}[]}
    subscriptions: {[k: string]: Subscription},
  }>({
    instanceId: Math.random().toString().substring(2),
    onMessageCallbacks: {},
    subscriptions: {},
  });

  const prefixTopic = useCallback((topic: string): string => {
    return window.APP_SETTINGS.centrifuge_topic_prefix + topic;
  }, []);

  const subscribe = useCallback((topic: string, noPrefix: boolean = false) => {
    // Determine the final topic name
    const finalTopic = noPrefix ? topic : prefixTopic(topic);
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    // Check if the topic is already subscribed
    if (finalTopic in state.current.subscriptions) {
      window.APP_SETTINGS.debug && console.log(`Subscription to the channel ${finalTopic} already exists`);
      return;
    }

    try {
      // Create a new subscription
      const newSubscription = client.current.newSubscription(finalTopic);

      // Store the subscription in the state
      state.current.subscriptions[finalTopic] = newSubscription;

      // Subscribe to the topic
      newSubscription.subscribe();

      // Handle publications on the topic
      newSubscription.on("publication", (ctx) => {
        if (!(finalTopic in state.current.onMessageCallbacks)) {
          return;
        }

        const callbacks = state.current.onMessageCallbacks[finalTopic];

        for (let i = 0; i < callbacks.length; i++) {
          callbacks[i].callback(ctx.data as object);
        }
      });
      
      if (newSubscription.state === "subscribing" &&  !hasReloaded) {
        console.log("State is still subscribing. Reloading the page...");
        sessionStorage.setItem('hasReloaded', 'true'); 
        window.location.reload();
      }
      window.APP_SETTINGS.debug && console.log(`Subscribed to the channel ${finalTopic}`);
    } catch (err: any) {
      // Handle the specific error for existing subscriptions
      if (err.message.includes("Subscription to the channel") && err.message.includes("already exists")) {
        window.APP_SETTINGS.debug && console.log(`Caught err: ${err.message}`);
      } else {
        window.APP_SETTINGS.debug && console.log(`Subscribe error: ${err}`);
        // Re-throw the err if it is not the expected err
        // throw err;
      }
    }
  }, [client, prefixTopic]);

  const unsubscribe = useCallback((topic: string, noPrefix: boolean = false) => {
    const topicWithPrefix = noPrefix ? topic : prefixTopic(topic);

    // console.log(`Attempting to unsubscribe from topic: ${topicWithPrefix}`);
    // Unsubscribe from all callbacks for the topic if no specific callback is provided
    // console.log(`Unsubscribing from all callbacks for topic: ${topicWithPrefix}`);
    client.current.removeSubscription(state.current.subscriptions[topicWithPrefix]);
    // state.current.subscriptions[topicWithPrefix]?.unsubscribe();
    delete state.current.onMessageCallbacks[topicWithPrefix];
    delete state.current.subscriptions[topicWithPrefix];

    console.log(`Unsubscribed from topic: ${topicWithPrefix}`);
  }, [prefixTopic]);

  const isSubscribed = useCallback((topic: string, noPrefix: boolean = false) => {
    const topicWithPrefix = noPrefix ? topic : prefixTopic(topic);
    return !!state.current.subscriptions[topicWithPrefix];
  }, [prefixTopic]);

  const publish = useCallback((topic: string, msg: object, noPrefix: boolean = false) => {
    const finalTopic = noPrefix ? topic : prefixTopic(topic);

    const attemptPublish = () => {
      client.current.publish(finalTopic, msg)
        .then(() => {
          window.APP_SETTINGS.debug && console.log(`Message published successfully to topic: ${finalTopic}`);
        })
        .catch(e => {
          if (e.code === 103) {  // 103: Permission denied
            window.APP_SETTINGS.debug && console.error(`Permission denied for topic: ${finalTopic}. Retrying subscription and publish...`);
            // Try subscribing again
            subscribe(topic, noPrefix);
            // Try publish again
            client.current.publish(finalTopic, msg)
              .then(() => {
                window.APP_SETTINGS.debug && console.log(`Message re-published successfully to topic: ${finalTopic} after retrying subscription.`);
              })
              .catch(retryError => {
                window.APP_SETTINGS.debug && console.error(`Retry failed for topic: ${finalTopic}. Error: ${retryError.message}`);
              });
          } else {
            window.APP_SETTINGS.debug && console.error(`Failed to publish message to topic: ${finalTopic}. Error: ${e.message}`);
          }
        });
    };

    attemptPublish();
  }, [client, prefixTopic, subscribe]);

  const onMessage = useCallback((topic: string, cb: (msg: object) => void, noPrefix: boolean = false) => {
    // Determine the final topic name
    const finalTopic = noPrefix ? topic : prefixTopic(topic);

    const item = {
      id: "_" + Math.random().toString().substring(2),
      callback: (msg: object) => {
        window.APP_SETTINGS.debug && console.log('Received message on topic', finalTopic, ':', msg);
        cb(msg);
      },
    };

    if (finalTopic in state.current.onMessageCallbacks) {
      state.current.onMessageCallbacks[finalTopic]?.push(item);
    } else {
      state.current.onMessageCallbacks[finalTopic] = [item];
    }

    subscribe(topic, noPrefix);

    return () => {
      state.current.onMessageCallbacks[finalTopic] = state?.current?.onMessageCallbacks[finalTopic]?.filter(c => c.id !== item.id) ?? [];

      if (state.current.onMessageCallbacks[finalTopic].length === 0) {
        unsubscribe(topic, noPrefix);
      }
    };
  }, [prefixTopic, subscribe, unsubscribe]);

  const publishProject = useCallback((projectId: number, msg: object) => {
    publish("project/" + projectId, msg);
  }, [publish]);

  const onProjectMessage = useCallback((projectId: number, callback: (msg: object) => void) => {
    return onMessage("project/" + projectId, callback);
  }, [onMessage]);

  const publishTask = useCallback((taskID: number, msg: object) => {
    publish("task/" + taskID, msg);
  }, [publish]);

  const onTaskMessage = useCallback((taskID: number, callback: (msg: object) => void) => {
    return onMessage("task/" + taskID, callback);
  }, [onMessage]);

  useDebouncedEffect(() => {
    window.APP_SETTINGS.debug && console.log("Message broker: " + window.APP_SETTINGS.centrifuge_server);

    client.current.on("connecting", () => {
      window.APP_SETTINGS.debug && console.log("Connecting to message broker");
    });

    client.current.on("connected", () => {
      window.APP_SETTINGS.debug && console.log("Connected to message broker");
    });

    client.current.on("disconnected", () => {
      window.APP_SETTINGS.debug && console.log("Disconnected to message broker");

      if (unmounted.current) {
        return;
      }

      client.current.connect();
    });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      client.current.disconnect();
    };
  }, [user?.centrifuge_token]);

  useDebouncedEffect(() => {
    unmounted.current = false;
    client.current.connect();

    return () => {
      unmounted.current = true;
    }
  }, []);

  return (
    <CentrifugeContext.Provider value={{
      subscribe,
      unsubscribe,
      publish,
      onMessage,
      publishProject,
      onProjectMessage,
      publishTask,
      onTaskMessage,
      isSubscribed
    }}>
      {props.children}
    </CentrifugeContext.Provider>
  );
};

export function useCentrifuge(): TCentrifugeProvider {
  return React.useContext(CentrifugeContext);
}
