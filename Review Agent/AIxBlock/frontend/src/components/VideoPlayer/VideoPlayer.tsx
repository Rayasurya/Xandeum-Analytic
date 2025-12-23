import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

import "./VideoPlayer.scss";
import IconDoubleArrowLeft from "@/assets/icons/IconDoubleArrowLeft";
import IconDoubleArrowRight from "@/assets/icons/IconDoubleArrowRight";
import IconPlay from "@/assets/icons/IconPlay";
import IconStopPlay from "@/assets/icons/IconStopPlay";
import Progress from "../Progress/Progress";

export type TVideoPlayerProps = {
  url: string;
  className?: string;
};

const VideoPlayer: React.FC<TVideoPlayerProps> = ({ url, className = "react-player" }) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const playerRef = useRef<any>(null);
  const handleTogglePlay = () => {
    setPlaying((prevPlaying) => !prevPlaying);
  };

  const handleBackward = () => {
    // if duration < 60 seconds when click back, then +- duration/10 seconds
    // duration > 60 seconds, when click next, the duration will be +- 10 seconds
    if (playerRef.current) {
      let newTime;
      if (duration < 60) {
        newTime = currentTime - duration / 10;
      } else {
        newTime = currentTime - 10;
      }
      playerRef.current.seekTo(newTime < 0 ? 0 : newTime, "seconds");
    }
  };

  const handleForward = () => {
    if (playerRef.current) {
      let newTime;
      if (duration < 60) {
        newTime = currentTime + duration / 10;
      } else {
        newTime = currentTime + 10;
      }
      playerRef.current.seekTo(
        newTime > duration ? duration : newTime,
        "seconds"
      );
    }
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
    <div className={`c-video`}>
      <div className="player-wrapper">
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          width={"100%"}
          height={"100%"}
          onProgress={handleProgress}
          className='react-player'
        />
      </div>
      <div className="c-video__progress">
        <span className="c-video__progress-start">
          {formatTime(currentTime)}
        </span>
        <Progress
          className="c-video__progress-item"
          percent={(currentTime / duration) * 100}
          strokeColor={"linear-gradient(#5C42FF, #8673FD)"}
        />
        <span className="c-video__progress-end">{formatTime(duration)}</span>
      </div>

      <div className="c-video__button">
        <span className="c-video__button-back" onClick={handleBackward}>
          <IconDoubleArrowLeft />
        </span>
        {playing ? (
          <span className="c-video__button-play" onClick={handleTogglePlay}>
            <IconStopPlay />
          </span>
        ) : (
          <span className="c-video__button-play" onClick={handleTogglePlay}>
            <IconPlay />
          </span>
        )}
        <span className="c-video__button-next" onClick={handleForward}>
          <IconDoubleArrowRight />
        </span>
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

export default VideoPlayer;
