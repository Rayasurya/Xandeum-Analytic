import React, { Fragment } from "react";
import { Button } from "antd";
import { observer } from "mobx-react";
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";

import Hint from "../../../components/Hint/Hint";
import Toggle from "../../../common/Toggle/Toggle";

const AudioControls = ({ item, store }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5em" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          type="primary"
          onClick={() => {
            item._ws.playPause();

            if (item.playing) {
              item.setLoopRegion(null);
            }
          }}
        >
          {item.playing && (
            <Fragment>
              <PauseCircleOutlined /> <span>Pause</span>
              {store.settings.enableTooltips && store.settings.enableHotkeys && item.hotkey && (
                <Hint>[{item.hotkey}]</Hint>
              )}
            </Fragment>
          )}
          {!item.playing && (
            <Fragment>
              <PlayCircleOutlined /> <span>Play</span>
              {store.settings.enableTooltips && store.settings.enableHotkeys && item.hotkey && (
                <Hint>[{item.hotkey}]</Hint>
              )}
            </Fragment>
          )}
        </Button>
        {item.redactable && (
          <Toggle
            checked={item.redactMode}
            label="Redact mode"
            onChange={() => item.toggleRedactMode()}
          />
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Toggle
          checked={item.loopPlay}
          label="Loop region"
          onChange={() => item.toggleLoopPlay()}
        />
        <Toggle
          checked={item.autoPlaySelection}
          label="Auto play selected region"
          onChange={() => item.toggleAutoPlaySelection()}
        />
      </div>
    </div>
  );
};

export default observer(AudioControls);
