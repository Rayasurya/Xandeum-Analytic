import Slider from "rc-slider";
import React, { useCallback, useEffect } from "react";
import styles from "./PredictParams.module.scss";
import InputBase from "../../InputBase/InputBase";
import Switch from "../../Switch/Switch";
import { randomString } from "@/utils/random";
import Button from "../../Button/Button";
import { confirmDialog } from "../../Dialog";
import EmptyContent from "../../EmptyContent/EmptyContent";

export type TPredictParams = {
  confidenceThreshold: number;
  iouThreshold: number;
  frame: number;
  fullVideo: boolean;
  tokenLength: number,
  temperature: number,
  topP: number,
  seed: number,
  maxGenLength: number,
  prompt: string,
}

export type TPredictParamsKey = keyof TPredictParams;
export type TPredictParamsValue = TPredictParams[TPredictParamsKey];

export type TProps = {
  onChange: (p: TPredictParams) => void;
  defaultParams: TPredictParams;
  projectID: number;
  onClose?: () => void;
  onOk?: () => void;
  isVideo?: boolean;
  isCV?: boolean;
  isLLM?: boolean;
  hasChat?: boolean;
}

export type TMessage = {
  id: string;
  message: string;
  type: "user" | "client";
}

export default function PredictParams({onChange, defaultParams, projectID, onClose, onOk, isVideo, hasChat, isCV, isLLM}: TProps) {
  const [params, setParams] = React.useState<TPredictParams>(defaultParams);
  const [messages, setMessages] = React.useState<TMessage[]>(
    JSON.parse(localStorage.getItem("predict-messages-" + projectID) ?? "[]") ?? []
  );

  const updateParam = useCallback((k: TPredictParamsKey, v: TPredictParamsValue) => {
    setParams(p => {
      const newParams = { ...p, [k]: v };
      onChange(newParams);
      return newParams;
    });
  }, [onChange]);

  useEffect(() => {
    localStorage.setItem("predict-messages-" + projectID, JSON.stringify(messages));

    if (messages.length > 0) {
      updateParam("prompt", messages[messages.length - 1].message);
    } else {
      updateParam("prompt", "");
    }
  }, [messages, projectID, updateParam]);

  const inputKeyUp = useCallback((ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (!ev.ctrlKey || ev.key !== "Enter") {
      return;
    }

    const newMessage = ev.currentTarget.value.trim();

    if (newMessage.length === 0) {
      return;
    }

    setMessages(l => [...l, {
      id: randomString(),
      message: newMessage,
      type: "user",
    }]);

    ev.currentTarget.value = "";
  }, []);

  const clearMessages = useCallback(() => {
    confirmDialog({
      title: "Clear messages",
      message: "Are you sure you want to clear all messages?",
      onSubmit: () => {
        setMessages([]);
      },
    });
  }, []);

  return (
    <div className={[styles.container, hasChat ? "" : styles.noChat].join(" ")}>
      <div className={styles.left}>
        <div className={styles.messages}>
          <div className={styles.messagesListWrapper}>
            <div className={styles.messagesList}>
              <EmptyContent message="Enter your prompt into the input below" />
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.type === "user" ? styles.messageUser : styles.messageSystem}
                >
                  {message.message}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.input}>
          <InputBase
            isMultipleLine={true}
            allowClear={false}
            onKeyUp={inputKeyUp}
            autoFocus={true}
            placeholder="Enter your prompt here"
          />
        </div>
        <div className={styles.bottomHint}>
          Press Ctrl + Enter to send message. <span className={styles.clearMessages} onClick={clearMessages}>Click here</span> to clear all messages.
        </div>
      </div>
      <div className={ styles.right }>
        <div className={ styles.rightWrapper }>
          <div className={ styles.config }>
            <div className={styles.rightTitle}>Parameters</div>
            {isLLM && (
              <>
                <div className={ styles.right2Columns }>
                  <div className={ styles.item }>
                    <label>Token length:</label>
                    <InputBase
                      type="number"
                      value={ params.tokenLength.toString() }
                      isControlledValue={ true }
                      allowClear={ false }
                      onChange={ e => updateParam("tokenLength", Number(e.target.value)) }
                    />
                  </div>
                  <div className={ styles.item }>
                    <label>Max gen. length:</label>
                    <InputBase
                      type="number"
                      value={ params.maxGenLength.toString() }
                      isControlledValue={ true }
                      allowClear={ false }
                      onChange={ e => updateParam("maxGenLength", Number(e.target.value)) }
                    />
                  </div>
                </div>
                <div className={ styles.item }>
                  <label>Seed:</label>
                  <InputBase
                    type="number"
                    value={ params.seed.toString() }
                    isControlledValue={ true }
                    allowClear={ false }
                    onChange={ e => updateParam("seed", Number(e.target.value)) }
                  />
                </div>
              </>
            )}
            { isVideo && (
              <>
                <div className={ styles.item }>
                  <label>Frame:</label>
                  <InputBase
                    type="number"
                    value={ params.frame.toString() }
                    isControlledValue={ true }
                    allowClear={ false }
                    onChange={ e => updateParam("frame", Number(e.target.value)) }
                  />
                </div>
                <div className={ styles.item }>
                  <Switch
                    label="Full video"
                    checked={ params.fullVideo }
                    size="medium"
                    onChange={ v => updateParam("fullVideo", v) }
                  />
                </div>
              </>
            ) }
            {isCV && (
              <>
                <div className={ styles.item }>
                  <label>Confidence Threshold: { params.confidenceThreshold }</label>
                  <Slider
                    className={ styles.slider }
                    min={ 0 }
                    max={ 1 }
                    step={ 0.01 }
                    defaultValue={ params.confidenceThreshold ?? 0.8 }
                    onChange={ (v: any) => updateParam("confidenceThreshold", Number(v)) }
                  />
                </div>
                <div className={ styles.item }>
                  <label>IOU Threshold: { params.iouThreshold }</label>
                  <Slider
                    className={ styles.slider }
                    min={ 0 }
                    max={ 1 }
                    step={ 0.01 }
                    defaultValue={ params.iouThreshold ?? 0.8 }
                    onChange={ (v: any) => updateParam("iouThreshold", Number(v)) }
                  />
                </div>
              </>
            ) }
            { isLLM && (
              <>
                <div className={ styles.item }>
                  <label>Temperature: { params.temperature }</label>
                  <Slider
                    className={ styles.slider }
                    min={ 0 }
                    max={ 1 }
                    step={ 0.01 }
                    defaultValue={ params.temperature ?? 0.9 }
                    onChange={ (v: any) => updateParam("temperature", Number(v)) }
                  />
                </div>
                <div className={ styles.item }>
                  <label>Top P: { params.topP }</label>
                  <Slider
                    className={ styles.slider }
                    min={ 0 }
                    max={ 1 }
                    step={ 0.01 }
                    defaultValue={ params.topP ?? 0.5 }
                    onChange={ (v: any) => updateParam("topP", Number(v)) }
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className={ styles.rightButtons }>
          <Button
            type="hot"
            isBlock={ true }
            onClick={ onClose }
          >
            Close
          </Button>
          <Button
            isBlock={ true }
            onClick={ onOk }
          >
            Ok
          </Button>
        </div>
      </div>
    </div>
  );
}
