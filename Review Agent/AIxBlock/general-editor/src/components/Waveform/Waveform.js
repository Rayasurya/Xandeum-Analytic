import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor";
import React, { createRef } from "react";
import throttle from "lodash.throttle";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";
import WaveSurfer from "wavesurfer.js";
import styles from "./Waveform.module.scss";
import globalStyles from "../../styles/global.module.scss";
import { Col, Row, Select, Slider } from "antd";
import { SoundOutlined } from "@ant-design/icons";
import messages from "../../utils/messages";
import { Hotkey } from "../../core/Hotkey";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { formatTimespan } from "../../utils/time";

const MIN_ZOOM_Y = 1;
const MAX_ZOOM_Y = 50;

/**
 * Use formatTimeCallback to style the notch labels as you wish, such
 * as with more detail as the number of pixels per second increases.
 *
 * Here we format as M:SS.frac, with M suppressed for times < 1 minute,
 * and frac having 0, 1, or 2 digits as the zoom increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override timeInterval, primaryLabelInterval and/or
 * secondaryLabelInterval so they all work together.
 *
 * @param: seconds
 * @param: pxPerSec
 */
function formatTimeCallback(seconds, pxPerSec) {
  seconds = Number(seconds);
  const minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;

  // fill up seconds with zeroes
  let secondsStr = Math.round(seconds).toString();

  if (pxPerSec >= 25 * 10) {
    secondsStr = seconds.toFixed(2);
  } else if (pxPerSec >= 25 * 1) {
    secondsStr = seconds.toFixed(1);
  }

  if (minutes > 0) {
    if (seconds < 10) {
      secondsStr = "0" + secondsStr;
    }
    return `${minutes}:${secondsStr}`;
  }
  return secondsStr;
}

/**
 * Use timeInterval to set the period between notches, in seconds,
 * adding notches as the number of pixels per second increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param: pxPerSec
 */
function timeInterval(pxPerSec) {
  let retval = 1;

  if (pxPerSec >= 25 * 100) {
    retval = 0.01;
  } else if (pxPerSec >= 25 * 40) {
    retval = 0.025;
  } else if (pxPerSec >= 25 * 10) {
    retval = 0.1;
  } else if (pxPerSec >= 25 * 4) {
    retval = 0.25;
  } else if (pxPerSec >= 25) {
    retval = 1;
  } else if (pxPerSec * 5 >= 25) {
    retval = 5;
  } else if (pxPerSec * 15 >= 25) {
    retval = 15;
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60;
  }
  return retval;
}

/**
 * Return the cadence of notches that get labels in the primary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function primaryLabelInterval(pxPerSec) {
  let retval = 1;

  if (pxPerSec >= 25 * 100) {
    retval = 10;
  } else if (pxPerSec >= 25 * 40) {
    retval = 4;
  } else if (pxPerSec >= 25 * 10) {
    retval = 10;
  } else if (pxPerSec >= 25 * 4) {
    retval = 4;
  } else if (pxPerSec >= 25) {
    retval = 1;
  } else if (pxPerSec * 5 >= 25) {
    retval = 5;
  } else if (pxPerSec * 15 >= 25) {
    retval = 15;
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60;
  }
  return retval;
}

/**
 * Return the cadence of notches to get labels in the secondary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Secondary labels are drawn after primary labels, so if
 * you want to have labels every 10 seconds and another color labels
 * every 60 seconds, the 60 second labels should be the secondaries.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function secondaryLabelInterval(pxPerSec) {
  // draw one every 10s as an example
  return Math.floor(10 / timeInterval(pxPerSec));
}

export default class Waveform extends React.Component {
  _unmounted = false;

  constructor(props) {
    super(props);

    this.hotkeys = Hotkey("Audio", "Audio Segmentation");

    this.state = {
      src: this.props.src,
      pos: 0,
      colors: {
        waveColor: "#FF71E8",
        progressColor: "#3838FF",
      },
      zoom: props.defaultZoom,
      zoomY: MIN_ZOOM_Y,
      speed: 1,
      volume: props.muted ? 0 : 1,
      volumeLeft: 1,
      volumeRight: 1,
      numberOfChannels: 1,
      // regions: [],
      duration: 0,
      scrollLeft: 0,
      waveWidth: 0,
      isLoading: true,
      progress: 0,
    };
  }

  /**
   * Handle to change zoom of wave
   */
  onChangeZoom = value => {
    this.setState({
      ...this.state,
      zoom: value,
    }, () => {
      this.wavesurfer.once("zoom", () => {
        this.updateWaveformSize();
      });

      this.wavesurfer.zoom(value);
    });
  };

  onChangeZoomY = value => {

    this.setState({
      ...this.state,
      zoomY: value,
    }, this.updateZoomY);
  };

  onChangeVolumeLeft = value => {
    this.setState({
      ...this.state,
      volumeLeft: value,
    }, this.updateVolumeLeft);
  };

  updateVolumeLeft = throttle(() => {
    if (this.wavesurfer.isPlaying() && this.isInRedactReg(this.wavesurfer.getCurrentTime())) {
      return;
    }

    this.leftGain.gain.value = this.state.volumeLeft;
  }, 100)

  onChangeVolumeRight = value => {
    this.setState({
      ...this.state,
      volumeRight: value,
    }, this.updateVolumeRight);
  };

  updateVolumeRight = throttle(() => {
    if (this.wavesurfer.isPlaying() && this.isInRedactReg(this.wavesurfer.getCurrentTime())) {
      return;
    }

    this.rightGain.gain.value = this.state.volumeRight;
  }, 100)

  updateZoomY = throttle(() => {
    this.wavesurfer.params.barHeight = this.state.zoomY;
    this.wavesurfer.drawBuffer();
  }, 100)

  onChangeVolume = value => {
    this.setState({
      ...this.state,
      volume: value,
    });

    if (this.wavesurfer.isPlaying() && this.isInRedactReg(this.wavesurfer.getCurrentTime())) {
      return;
    }

    this.wavesurfer.setVolume(value);
  };

  /**
   * Handle to change speed of wave
   */
  onChangeSpeed = value => {
    this.setState({
      ...this.state,
      speed: value,
    });

    this.wavesurfer.setPlaybackRate(value);
  };

  onZoomPlus = (ev, step = 10) => {
    let val = this.state.zoom;

    val = val + step;
    if (val > 700) val = 700;

    this.onChangeZoom(val);
    ev && ev.preventDefault();
    return false;
  };

  onZoomMinus = (ev, step = 10) => {
    let val = this.state.zoom;

    val = val - step;
    if (val < 50) val = 50;

    this.onChangeZoom(val);
    ev.preventDefault();
    return false;
  };

  onZoomYPlus = (ev, step = 1) => {
    let val = this.state.zoomY;

    val = val + step;
    if (val > MAX_ZOOM_Y) val = MAX_ZOOM_Y;

    this.onChangeZoomY(val);
    ev.preventDefault();
    return false;
  };

  onZoomYMinus = (ev, step = 1) => {
    let val = this.state.zoomY;

    val = val - step;
    if (val < MIN_ZOOM_Y) val = MIN_ZOOM_Y;

    this.onChangeZoomY(val);
    ev && ev.preventDefault();
    return false;
  };

  onWheel = e => {
    if (e && !e.shiftKey) {
      return;
    } else if (e && e.shiftKey) {
      /**
       * Disable scrolling page
       */
      e.preventDefault();
    }

    const step = e.deltaY > 0 ? 5 : -5;
    // console.log(e.evt.deltaY);

    this.onZoomPlus(e, step);
  };

  onBack = () => {
    let time = this.wavesurfer.getCurrentTime();

    if (!time) return false;
    time--;
    this.wavesurfer.setCurrentTime(time > 0 ? time : 0);
    return false;
  };

  // updateRegion = throttle((reg) => {
  //   const regions = this.state.regions.filter(r => r.id !== reg.id);
  //
  //   this.setState({
  //     ...this.state,
  //     regions: [
  //       ...regions,
  //       reg,
  //     ],
  //   });
  // }, 50);

  // deleteRegion = throttle((reg) => {
  //   this.setState({
  //     ...this.state,
  //     regions: this.state.regions.filter(r => r.id !== reg.id),
  //   });
  // }, 50);

  isInRedactReg(time) {
    const arr = [...this.props.item.redactArr];

    for (let i = 0; i < arr.length; i += 2) {
      if (time >= arr[i] && time <= arr[i + 1]) {
        return true;
      }
    }

    return false;
  }

  muteRedactReg() {
    if (this._unmounted) return;
    requestAnimationFrame(() => this.muteRedactReg());

    if (!this.wavesurfer.isPlaying()) {
      return;
    }

    if (this.isInRedactReg(this.wavesurfer.getCurrentTime())) {
      this.wavesurfer.setVolume(0);
    } else {
      this.wavesurfer.setVolume(this.state.volume);

      if (this.leftGain && this.leftGain.gain.value !== this.state.volumeLeft) {
        this.leftGain.gain.value = this.state.volumeLeft;
      }

      if (this.rightGain && this.rightGain.gain.value !== this.state.volumeRight) {
        this.rightGain.gain.value = this.state.volumeRight;
      }
    }
  }

  componentDidMount() {
    this._unmounted = false;

    /**
     * @type {import("wavesurfer.js/types/params").WaveSurferParams}
     */
    let wavesurferConfigure = {
      container: this.$waveform,
      waveColor: this.state.colors.waveColor,
      height: this.props.height,
      backend: "WebAudio",
      progressColor: this.state.colors.progressColor,

      splitChannels: true,
      cursorWidth: this.props.cursorWidth,
      cursorColor: this.props.cursorColor,
      barHeight: 1,
      responsive: true,
      fillParent: true,
      minPxPerSec: 50,
      maxCanvasWidth: 20000,
    };

    if (this.props.regions) {
      wavesurferConfigure = {
        ...wavesurferConfigure,
        plugins: [
          RegionsPlugin.create({
            dragSelection: {
              slop: 5, // slop
            },
          }),
          TimelinePlugin.create({
            container: "#timeline", // the element in which to place the timeline, or a CSS selector to find it
            formatTimeCallback, // custom time format callback. (Function which receives number of seconds and returns formatted string)
            timeInterval, // number of intervals that records consists of. Usually it is equal to the duration in minutes. (Integer or function which receives pxPerSec value and returns value)
            primaryLabelInterval, // number of primary time labels. (Integer or function which receives pxPerSec value and reurns value)
            secondaryLabelInterval, // number of secondary time labels (Time labels between primary labels, integer or function which receives pxPerSec value and reurns value).
            primaryColor: "blue", // the color of the modulo-ten notch lines (e.g. 10sec, 20sec). The default is '#000'.
            secondaryColor: "blue", // the color of the non-modulo-ten notch lines. The default is '#c0c0c0'.
            primaryFontColor: "#111", // the color of the non-modulo-ten time labels (e.g. 10sec, 20sec). The default is '#000'.
            secondaryFontColor: "#777",
          }),
          CursorPlugin.create({
            wrapper: this.$waveform,
            showTime: true,
            opacity: 1,
            formatTimeCallback: formatTimespan,
          }),
        ],
      };
    }

    this.wavesurfer = WaveSurfer.create({
      ...wavesurferConfigure,
    });

    this.wavesurfer.setHeight(36);

    if (this.props.defaultVolume) {
      this.wavesurfer.setVolume(this.props.defaultVolume);
    }

    if (this.props.muted) {
      this.wavesurfer.setVolume(0);
    }

    if (this.props.defaultSpeed) {
      this.wavesurfer.setPlaybackRate(this.props.defaultSpeed);
    }

    if (this.props.defaultZoom) {
      this.wavesurfer.zoom(this.props.defaultZoom);
    }

    this.wavesurfer.on("error", e => {
      const error = String(e.message || e || "");
      const url = this.props.src;

      // just general error message
      let body = messages.ERR_LOADING_AUDIO({ attr: this.props.dataField, error, url });

      // "Failed to fetch" or HTTP error
      if (error?.includes("HTTP") || error?.includes("fetch")) {
        this.wavesurfer.hadNetworkError = true;

        body = messages.ERR_LOADING_HTTP({ attr: this.props.dataField, error, url });
      } else if (typeof e === "string" && e.includes("media element")) {
        // obviously audio cannot be parsed if it was not loaded successfully
        // but WS can generate such error even after network errors, so skip it
        if (this.wavesurfer.hadNetworkError) return;
        // "Error loading media element"
        body = "Error while processing audio. Check media format and availability.";
      }

      if (this.props.onError) this.props.onError(body);
    });

    this.wavesurfer.on("loading", percent => {
      if (percent === this.state.progress) return;

      this.setState({
        ...this.state,
        progress: percent,
      });
    });

    /**
     * Load data
     */
    this.wavesurfer.load(this.props.src);

    /**
     * Speed of waveform
     */
    this.wavesurfer.setPlaybackRate(this.state.speed);

    const self = this;

    if (this.props.regions) {
      /**
       * Mouse enter on region
       */
      this.wavesurfer.on("region-mouseenter", reg => {
        reg._region?.onMouseOver();
      });

      /**
       * Mouse leave on region
       */
      this.wavesurfer.on("region-mouseleave", reg => {
        reg._region?.onMouseLeave();
      });

      /**
       * Add region to wave
       */
      this.wavesurfer.on("region-created", (reg) => {
        if (reg.attributes.redact === "1" || (this.props.item.redactable && this.props.item.redactMode)) {
          reg.attributes.redact = "1";
          this.props.item.redactor.addRedactReg(this.wavesurfer, reg);
          return;
        }

        reg.element.style.zIndex = "4";
        const history = self.props.item.annotation.history;

        // if user draw new region the final state will be in `onUpdateEnd`
        // so we should skip history action in `addRegion`;
        // during annotation init this step will be rewritten at the end
        // during undo/redo this action will be skipped the same way
        history.setSkipNextUndoState();
        const region = self.props.addRegion(reg);

        if (!region) return;

        reg._region = region;
        reg.color = region.selectedregionbg;

        reg.on("click", (ev) => region.onClick(self.wavesurfer, ev));
        reg.on("update-end", () => region.onUpdateEnd(self.wavesurfer));

        reg.on("dblclick", () => {
          window.setTimeout(function() {
            reg.play();
          }, 0);
        });

        reg.on("out", () => {});
        // this.updateRegion(reg);
      });

      // this.wavesurfer.on("region-removed", (reg) => {
      //   this.deleteRegion(reg);
      // });
      //
      // this.wavesurfer.on("region-updated", (reg) => {
      //   this.updateRegion(reg);
      // });
    }

    /**
     * Handler of slider
     */
    const slider = document.querySelector("#slider");

    if (slider) {
      slider.oninput = function() {
        self.wavesurfer.zoom(Number(this.value));
      };
    }

    this.wavesurfer.on("ready", () => {
      self.props.onCreate(this.wavesurfer);

      this.wavesurfer.container.onwheel = throttle(this.onWheel, 100);

      if (this.wavesurfer.backend.buffer.numberOfChannels > 1) {
        const splitter = this.wavesurfer.backend.ac.createChannelSplitter(2);
        const merger = this.wavesurfer.backend.ac.createChannelMerger(2);

        this.leftGain = this.wavesurfer.backend.ac.createGain();
        this.rightGain = this.wavesurfer.backend.ac.createGain();

        // Here is where the wavesurfer and web audio combine.
        splitter.connect(this.leftGain, 0);
        splitter.connect(this.rightGain, 1);
        this.leftGain.connect(merger, 0, 0);
        this.rightGain.connect(merger, 0, 1);

        this.wavesurfer.backend.setFilters([splitter, this.leftGain, this.rightGain, merger]);

        this.setState({
          ...this.state,
          numberOfChannels: this.wavesurfer.backend.buffer.numberOfChannels,
        });
      }

      self.setState({
        ...this.state,
        duration: this.wavesurfer.getDuration(),
      });

      this.waveformContainer = this.wavesurfer.container.children[0];
      this.updateWaveformSize();

      this.setState({
        ...this.state,
        isLoading: false,
      });
    });

    this.wavesurfer.on("scroll", () => {
      this.updateWaveformSize();
    });

    this.wavesurfer.on("waveform-ready", () => {
      this.props.onReady?.(this.wavesurfer);
      this.updateWaveformSize();
    });

    /**
     * Pause trigger of audio
     */
    this.wavesurfer.on("pause", self.props.handlePlay);

    /**
     * Play trigger of audio
     */
    this.wavesurfer.on("play", self.props.handlePlay);

    this.wavesurfer.on("seek", self.props.handleSeek);

    // this.wavesurfer.on("audioprocess", (time) => {
    //   console.log(time);
    //
    //   for (const regKey in this.wavesurfer.regions.list) {
    //     const reg = this.wavesurfer.regions.list[regKey];
    //
    //     if (time >= reg.start && time <= reg.end) {
    //       for (let i = 0; i <= reg.handlers["click"].length; i++) {
    //         reg.handlers["click"](new MouseEvent("click"));
    //       }
    //     }
    //   }
    // });

    this.wavesurfer.on("region-in", (reg) => {
      if (reg._region && !reg._region.selected) {
        reg._region.onClick(this.wavesurfer, new MouseEvent("click"));
      }
    });

    this.wavesurfer.on("region-out", (reg) => {
      // if (reg._region.selected) {
      //   reg._region.onClick(this.wavesurfer, new MouseEvent("click"));
      // }
    });

    this.wavesurfer.on("play-region", (reg, isForce) => {
      if (reg._region.selected && (isForce || this.props.autoPlaySelection)) {
        this.wavesurfer.seekTo(reg.start / this.wavesurfer.getDuration());
        reg.play();
        this.props.handleSyncPlay();
      }
    });

    this.wavesurfer.on("play-region-loop", (reg, isForce) => {
      if (reg._region.selected && (isForce || this.props.autoPlaySelection)) {
        this.wavesurfer.seekTo(reg.start / this.wavesurfer.getDuration());
        reg.playLoop();
        this.props.handleSyncPlay();
      }
    });

    if (this.props.regions) {
      this.props.onLoad(this.wavesurfer);
    }

    this.hotkeys.addNamed("audio:back", this.onBack, Hotkey.DEFAULT_SCOPE + "," + Hotkey.INPUT_SCOPE);
    this.muteRedactReg();
  }

  componentWillUnmount() {
    this._unmounted = true;
    this.hotkeys.unbindAll();
    this.wavesurfer.unAll();
    this.wavesurfer.stop();
  }

  setWaveformRef = node => {
    this.$waveform = node;
  };

  updateWaveformSize = throttle(() => {
    if (!this.waveformContainer) return;

    this.setState({
      ...this.state,
      scrollLeft: this.waveformContainer.scrollLeft,
      waveWidth: this.waveformContainer.scrollWidth,
    });
  }, 50);

  render() {
    const self = this;

    const speeds = ["0.5", "0.75", "1.0", "1.25", "1.5", "2.0"];

    return (
      <div
        style={{
          position: "relative",
        }}
      >
        {this.state.isLoading && (
          <div
            style={{
              alignItems: "center",
              backdropFilter: "blur(3px)",
              backgroundColor: "#fff",
              color: "#111",
              display: "flex",
              height: "calc(100% + 16px)",
              justifyContent: "center",
              left: -8,
              position: "absolute",
              top: -8,
              zIndex: 10,
              width: "calc(100% + 16px)",
            }}
          >
            {
              this.state.progress === 100
                ? "Processing audio file... Please wait a moment!"
                : `Loading ${this.state.progress}%...`
            }
          </div>
        )}


        <div id="wave" ref={this.setWaveformRef} className={styles.wave} />

        <div id="timeline" />

        {/*<div
          id="region-bars"
          style={{
            // backgroundColor: "#0000FF",
            height: 28,
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {this.state.regions.map(r => {
            const left = r.start / this.state.duration * this.state.waveWidth - this.state.scrollLeft;
            const labels = [];

            if (typeof r._region?.results === "object") {
              for (let i = 0; i < r._region.results.length; i++) {
                if (r._region.results[i].type !== "labels") continue;
                labels.push(r._region.results[i].value.labels);
              }
            }

            return (
              <div
                key={"region-bar-" + r.id}
                onClick={ev => r.fireEvent("click", ev)}
                style={{
                  alignItems: "center",
                  backgroundColor: r.color,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  bottom: 0,
                  boxSizing: "border-box",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: 12,
                  left: left + "px",
                  overflowX: "hidden",
                  paddingLeft: 8,
                  paddingRight: 8,
                  position: "absolute",
                  textOverflow: "ellipsis",
                  top: 0,
                  whiteSpace: "nowrap",
                  width: (r.end - r.start) / this.state.duration * this.state.waveWidth + "px",
                }}
              >
                {labels.join(", ")}
              </div>
            );
          })}
        </div>*/}

        {this.props.zoom && (
          <Row gutter={16} style={{ marginTop: "0.5em" }}>
            <Col flex={8} style={{ textAlign: "right", marginTop: "6px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ marginTop: "6px", marginRight: "5px" }}>
                  <Tooltip placement="topLeft" title="Horizontal zoom out">
                    <ZoomOutOutlined onClick={this.onZoomMinus} className={globalStyles.link} />
                  </Tooltip>
                </div>
                <div style={{ width: "100%" }}>
                  <Slider
                    min={50}
                    step={10}
                    max={500}
                    value={typeof this.state.zoom === "number" ? this.state.zoom : 0}
                    onChange={value => {
                      this.onChangeZoom(value);
                    }}
                  />
                </div>
                <div style={{ marginTop: "6px", marginLeft: "5px" }}>
                  <Tooltip placement="topLeft" title="Horizontal zoom in">
                    <ZoomInOutlined onClick={this.onZoomPlus} className={globalStyles.link} />
                  </Tooltip>
                </div>
              </div>
            </Col>
            <Col flex={4} style={{ textAlign: "right", marginTop: "6px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ marginTop: "6px", marginRight: "5px" }}>
                  <Tooltip placement="topLeft" title="Vertical zoom out">
                    <ZoomOutOutlined onClick={this.onZoomYMinus} className={globalStyles.link} />
                  </Tooltip>
                </div>
                <div style={{ width: "100%" }}>
                  <Slider
                    min={MIN_ZOOM_Y}
                    step={.1}
                    max={MAX_ZOOM_Y}
                    value={typeof this.state.zoomY === "number" ? this.state.zoomY : MIN_ZOOM_Y}
                    onChange={value => {
                      this.onChangeZoomY(value);
                    }}
                  />
                </div>
                <div style={{ marginTop: "6px", marginLeft: "5px" }}>
                  <Tooltip placement="topLeft" title="Vertical zoom in">
                    <ZoomInOutlined onClick={this.onZoomYPlus} className={globalStyles.link} />
                  </Tooltip>
                </div>
              </div>
            </Col>
            {this.state.numberOfChannels > 1 && (
              <Col flex={3} style={{ textAlign: "right", marginTop: "6px" }}>
                <div style={{ display: "flex" }}>
                  <div style={{ marginTop: "6px", marginRight: "5px" }}>
                    <Tooltip placement="topLeft" title="Left channel volume">
                      <a
                        onClick={() => {
                          if (this.state.volumeLeft > 0) {
                            this.onChangeVolumeLeft(0);
                          } else {
                            this.onChangeVolumeLeft(1);
                          }
                        }}
                      >
                        L
                      </a>
                    </Tooltip>
                  </div>
                  <div style={{ width: "100%" }}>
                    <Slider
                      min={0}
                      step={.1}
                      max={1}
                      value={typeof this.state.volumeLeft === "number" ? this.state.volumeLeft : 1}
                      onChange={value => {
                        this.onChangeVolumeLeft(value);
                      }}
                    />
                  </div>
                </div>
              </Col>
            )}
            {this.state.numberOfChannels > 1 && (
              <Col flex={3} style={{ textAlign: "right", marginTop: "6px" }}>
                <div style={{ display: "flex" }}>
                  <div style={{ marginTop: "6px", marginRight: "5px" }}>
                    <Tooltip placement="topLeft" title="Right channel volume">
                      <a
                        onClick={() => {
                          if (this.state.volumeRight > 0) {
                            this.onChangeVolumeRight(0);
                          } else {
                            this.onChangeVolumeRight(1);
                          }
                        }}
                      >
                        R
                      </a>
                    </Tooltip>
                  </div>
                  <div style={{ width: "100%" }}>
                    <Slider
                      min={0}
                      step={.1}
                      max={1}
                      value={typeof this.state.volumeRight === "number" ? this.state.volumeRight : 1}
                      onChange={value => {
                        this.onChangeVolumeRight(value);
                      }}
                    />
                  </div>
                </div>
              </Col>
            )}
            <Col flex={4}>
              {this.props.volume && (
                <div style={{ display: "flex", marginTop: "6.5px" }}>
                  <div style={{ width: "100%" }}>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={typeof this.state.volume === "number" ? this.state.volume : 1}
                      onChange={value => {
                        this.onChangeVolume(value);
                      }}
                    />
                  </div>
                  <div style={{ marginLeft: "10px", marginTop: "5px" }}>
                    <SoundOutlined />
                  </div>
                </div>
              )}
            </Col>
            <Col flex={1} style={{ marginTop: "6px" }}>
              {this.props.speed && (
                <Select
                  placeholder="Speed"
                  style={{ width: "100%" }}
                  defaultValue={this.state.speed}
                  onChange={self.onChangeSpeed}
                >
                  {speeds.map(speed => (
                    <Select.Option value={+speed} key={speed}>
                      Speed {speed}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Col>
          </Row>
        )}
      </div>
    );
  }
}
