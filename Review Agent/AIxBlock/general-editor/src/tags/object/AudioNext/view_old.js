
import { inject, observer } from "mobx-react";
import React, { Fragment, useMemo } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import ObjectTag from "../../../components/Tags/Object";
import Waveform from "../../../components/Waveform/Waveform";
import AudioControls from "../Audio/Controls";
import { SimplePlayer } from "../Audio/SimplePlayer";

const HtxAudioView = ({ store, item }) => {


  if (!item._value) return null;

  const val = useMemo(() => {
    return item.processedValue();
  }, [item._value]);

  const player = useMemo(() => {
    if (item.mode === "simple") {
      return (<SimplePlayer url={val} />);
    } else {
      return (
        <>
          <Waveform
            key={item.reloadKey}
            dataField={item.value}
            src={val}
            muted={item.muted}
            item={item}
            selectRegion={item.selectRegion}
            handlePlay={item.handlePlay}
            handleSeek={item.handleSeek}
            onCreate={item.wsCreated}
            addRegion={item.addRegion}
            onLoad={item.onLoad}
            onReady={item.onReady}
            onError={item.onError}
            speed={item.speed}
            zoom={item.zoom}
            defaultVolume={Number(item.defaultvolume)}
            defaultSpeed={Number(item.defaultspeed)}
            defaultZoom={Number(Math.max(item.defaultzoom, 50))}
            volume={item.volume}
            regions={true}
            height={item.height}
            cursorColor={item.cursorcolor}
            cursorWidth={item.cursorwidth}
            autoPlaySelection={item.autoPlaySelection}
            handleSyncPlay={item.handleSyncPlay}
            loopPlay={item.loopPlay}
          />
          <AudioControls item={item} store={store} />
        </>
      );
    }
  }, [item.mode, item.autoPlaySelection, item.loopPlay, item.reloadKey]);

  return (
    <ObjectTag item={item}>
      <Fragment>
        {item.errors?.map((error, i) => (
          <ErrorMessage key={`err-${i}`} error={error} />
        ))}
        {player}
        <div style={{ marginBottom: "4px" }}></div>
      </Fragment>
    </ObjectTag>
  );
};

export const HtxAudio = inject("store")(observer(HtxAudioView));
