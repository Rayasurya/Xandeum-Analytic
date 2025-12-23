import { render, unmountComponentAtNode } from "react-dom";
import App from "./components/App/App";
import { configureStore } from "./configureStore";
import { AIxBlock as AIxBlockReact } from './Component';
import { registerPanels } from "./registerPanels";
import { configure } from "mobx";
import { EventInvoker } from './utils/events';
import legacyEvents from './core/External';
import { toCamelCase } from "strman";
import { isDefined } from "./utils/utilities";
import { Hotkey } from "./core/Hotkey";
import defaultOptions from './defaultOptions';
import { destroy } from "mobx-state-tree";

configure({
  isolateGlobalState: true,
});

export class AIxBlock {
  static instances = new Set();

  static destroyAll() {
    this.instances.forEach(inst => inst.destroy());
    this.instances.clear();
  }

  constructor(root, userOptions = {}) {
    const options = Object.assign({}, defaultOptions, userOptions ?? {});

    if (options.keymap) {
      Hotkey.setKeymap(options.keymap);
    }

    this.root = root;
    this.events = new EventInvoker();
    this.options = options ?? {};
    this.destroy = (() => { /* noop */ });

    this.supportLgacyEvents(options);
    this.createApp();

    this.constructor.instances.add(this);
  }

  on(...args) {
    this.events.on(...args);
  }

  off(eventName, callback){
    if (isDefined(callback)) {
      this.events.off(eventName, callback);
    } else {
      this.events.removeAll(eventName);
    }
  }

  async createApp() {
    let rootElement;
    const loadingElement = document.createElement("div");

    loadingElement.style.padding = "1rem";
    loadingElement.style.textAlign = "center";
    loadingElement.innerHTML = "Initializing editor UI...";

    if (typeof this.root === "string") {
      rootElement = document.getElementById(this.root);
    }

    if (rootElement) {
      rootElement.appendChild(loadingElement);
    }

    const originalTitle = document.title;

    const showPercent = (percent) => {
      document.title = "Processing... " + Math.ceil(percent) + "%";
      loadingElement.innerHTML = "Initializing editor... " + Math.ceil(percent) + "%";
    };

    this.events.on("processValueProgress", showPercent);
    this.events.on("processRelationProgress", showPercent);

    configureStore(this.options, this.events)
      .then(({ store, getRoot }) => {
        this.events.off("processAnnotationProgress", showPercent);
        this.events.off("processRelationProgress", showPercent);
        document.title = originalTitle;

        rootElement = getRoot(this.root);
        this.store = store;
        window.Htx = this.store;

        render((
          <App
            store={this.store}
            panels={registerPanels(this.options.panels) ?? []}
          />
        ), rootElement);

        this.destroy = (callback) => {
          unmountComponentAtNode(rootElement);
          destroy(this.store);

          if (callback) {
            callback();
          }
        };
      })
      .catch(e => {
        this.events.invoke("error", e);
        this.store?.beforeDestroy();
        if (rootElement) rootElement.innerHTML = e;
      });
  }

  supportLgacyEvents() {
    const keys = Object.keys(legacyEvents);

    keys.forEach(key => {
      const callback = this.options[key];

      if (isDefined(callback)) {
        const eventName = toCamelCase(key.replace(/^on/, ''));

        this.events.on(eventName, callback);
      }
    });
  }
}

AIxBlock.Component = AIxBlockReact;
