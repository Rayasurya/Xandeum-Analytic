import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

import "./AudioPlayer.scss";
import IconPlay from "@/assets/icons/IconPlay";
import IconStopPlay from "@/assets/icons/IconStopPlay";
import Progress from "../Progress/Progress";
import { TItemCrawl } from "@/pages/Project/Settings/CrawlData/CrawlData";

export type TAudioPlayerProps = {
  url: string;
  data: TItemCrawl;
};

const AudioPlayer: React.FC<TAudioPlayerProps> = ({ url, data }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const playerRef = useRef<any>(null);
  const handleTogglePlay = () => {
    setPlaying((prevPlaying) => !prevPlaying);
  };

  const handleProgress = (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    setCurrentTime(progress.playedSeconds);
    setDuration(progress.loadedSeconds);
  };

  return (
    <div className={`c-audio`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        width={"100%"}
        height={"100%"}
        onProgress={handleProgress}
      />
      <div className="c-audio__progress">
        <div className="c-audio__progress-time">
          <span className="c-audio__progress-start">
            {formatTime(currentTime)}
          </span>

          <span className="c-audio__progress-end">{formatTime(duration)}</span>
        </div>

        <Progress
          className="c-audio__progress-item"
          percent={(currentTime / duration) * 100}
          strokeColor={"linear-gradient(#5C42FF, #8673FD)"}
        />
      </div>

      <div className="c-audio__content">
        <h3 className="c-audio__content-title">{data.title}</h3>
      </div>

      <div className="c-audio__button">
        {playing ? (
          <span className="c-audio__button-play" onClick={handleTogglePlay}>
            <IconStopPlay />
          </span>
        ) : (
          <span className="c-audio__button-play" onClick={handleTogglePlay}>
            <IconPlay />
          </span>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default AudioPlayer;
