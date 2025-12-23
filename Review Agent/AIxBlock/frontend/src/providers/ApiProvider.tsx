import React from "react";
import Endpoints, {getEndpoint} from "../endpoints";

export type TApiCallOptions = Partial<Omit<RequestInit, "signal" | "body">> & {
  abortController?: AbortController,
  autoRefreshToken?: boolean,
  body?: any,
  params?: { [k: string]: string },
  query?: URLSearchParams,
};

export type TApiCallResult = {
  controller: AbortController,
  promise: Promise<Response>,
}

export type TApiProvider = {
  call: (endpoint: keyof typeof Endpoints, options?: TApiCallOptions) => TApiCallResult,
  getCsrfToken: () => string,
}

export const ApiContext = React.createContext<TApiProvider>({
  call: () => ({
    controller: new AbortController(),
    promise: Promise.resolve(new Response()),
  }),
  getCsrfToken: () => "",
})

export default function ApiProvider(props: React.PropsWithChildren) {
  const [csrfToken] = React.useState<string>(
    document.querySelector(`[name="csrfmiddlewaretoken"]`)?.getAttribute("value") ?? ""
  );

  const getCsrfToken = React.useCallback(() => {
    return csrfToken;
  }, [csrfToken]);

  function handleError(e: any, reject: (reason?: any) => void) {
    let isHandled = false;

    if (e instanceof DOMException) {
      if (e.name === "AbortError") {
        isHandled = true;
      } else if (e.name === "NetworkError") {
        isHandled = true;
      }
    }

    reject(e);

    if (window.APP_SETTINGS.debug) {
      console.error(e);
    }

    return isHandled;
  }

  const call = React.useCallback((
    endpoint: keyof typeof Endpoints,
    options?: TApiCallOptions,
  ): TApiCallResult => {
    let isNotFormData = true;
    const abortController = options?.abortController ?? new AbortController();
    const headers =  (options?.headers ?? {}) as { [key: string]: string };
    const credentials = options?.credentials ?? "same-origin";
    const queries = options?.query ? "?" + options?.query : "";
    let body = options?.body;

    headers["pragma"] = "no-cache";
    headers["cache-control"] = "no-cache";

    if (body && body instanceof FormData) {
      isNotFormData = false;
    }

    if (isNotFormData && !Object.hasOwn(headers, "Content-Type")) {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";

      if (body) {
        body = JSON.stringify(body);
      }
    }

    let [method, url] = getEndpoint(endpoint);
    const finalOptions = options ?? {};

    Object.assign(finalOptions, {
      cache: options?.cache ?? "no-cache",
      credentials,
      headers,
      method,
      signal: abortController.signal,
    });

    if (body) {
      Object.assign(finalOptions, {body});
    }

    if (window.APP_SETTINGS.debug) {
      console.info(Endpoints[endpoint], finalOptions);
    }

    if (options?.params) {
      for (let pk in options.params) {
        url = url.replaceAll(":" + pk, options.params[pk]);
      }
    }

    let hostname = window.APP_SETTINGS.hostname;

    if (!hostname.endsWith("/")) {
      hostname = hostname + "/";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      hostname = "";
    }

    const promise = new Promise<Response>((resolve, reject) => {
      try {
        fetch(hostname + url + queries, finalOptions)
          .then(r => resolve(r))
          .catch(e => handleError(e, reject));
      } catch (e) {
        handleError(e, reject);
      }
    });

    return {controller: abortController, promise};
  }, []);

  const providerValue = React.useMemo<TApiProvider>(() => {
    return {
      call,
      getCsrfToken,
    };
  }, [
    call,
    getCsrfToken,
  ]);

  return (
    <ApiContext.Provider value={providerValue}>
      {props.children}
    </ApiContext.Provider>
  );
}

export function useApi(): TApiProvider {
  return React.useContext(ApiContext);
}
