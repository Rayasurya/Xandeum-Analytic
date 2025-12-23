/// <reference types="react-scripts" />

import ReactDOM from "react-dom/client";
import {Centrifuge} from "centrifuge";

declare module "*.module.scss";

declare global {
  interface Window {
    UIRender: (rootElement: HTMLElement) => ReactDOM.Root,
    APP_SETTINGS: {
      title: string,
      debug: boolean,
      mqtt_server: string,
      mqtt_port: number,
      mqtt_port_tls: number,
      storage_server: string,
      centrifuge_server: string,
      centrifuge_topic_prefix: string,
      toolbar_predict_sam: string,
      toolbar_predict_rectangle: string,
      toolbar_predict_polygon: string,
      hostname: string,
      ip_compute: string,
      editor_keymap: object,
      feature_flags: object,
      feature_flags_default_value: object,
      csrf: string,
      lsfJS: string,
      lsfCSS: string,
      riaJS?: string,
      riaCSS?: string,
      tdeJS?: string,
			tdeCSS?: string,
			llmJS?: string,
      llmCSS?: string,
      paypalClientId: string,
      stripePublicKey: string,
      debugPredictUrl?: string,
      debugML?: boolean,
      workflowEndpoint: string,
    },
    AIxBlock?: any,
    RIA?: (props: Object, element: HTMLDivElement) => () => void,
		TDE?: (props: Object, element: HTMLDivElement) => void,
    LLM?: (props: Object, element: HTMLDivElement) => void,
    centrifuge?: Centrifuge,
    pwf: any,
  }

  interface String {
    toUpperCaseFirst(): string;
  }

  interface Object {
    hasOwn(o: object, v: PropertyKey): boolean;
  }
}
