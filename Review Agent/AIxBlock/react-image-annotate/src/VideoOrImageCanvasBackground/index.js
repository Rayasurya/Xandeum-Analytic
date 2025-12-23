// @flow weak

import React, { useRef, useEffect, useMemo, useState } from "react"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import useEventCallback from "use-event-callback"
import { useSettings } from "../SettingsProvider"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const Video = styled("video")(({ theme }) => ({
  zIndex: 0,
  position: "absolute",
}))

const StyledImage = styled("img")(({ theme }) => ({
  zIndex: 0,
  position: "absolute",
  border: "dashed 1px #888888",
}))

const Error = styled("div")(({ theme }) => ({
  zIndex: 0,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  // backgroundColor: "rgba(255,0,0,0.06)",
  color: "#cc5a5a",
  // fontWeight: "bold",
  whiteSpace: "pre-wrap",
  padding: 50,
}))

export default ({
  imagePosition,
  mouseEvents,
  videoTime,
  videoSrc,
  imageSrc,
  onLoad,
  useCrossOrigin = false,
  videoPlaying,
  onChangeVideoTime,
  onChangeVideoPlaying,
  imageId,
  onError,
}) => {
  const settings = useSettings()
  const videoRef = useRef()
  const imageRef = useRef()
  const [error, setError] = useState()

  useEffect(() => {
    if (!videoPlaying && videoRef.current) {
      videoRef.current.currentTime = (videoTime || 0) / 1000
    }
  }, [videoTime])

  useEffect(() => {
    let renderLoopRunning = false
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.play()
        renderLoopRunning = true
        if (settings.videoPlaybackSpeed) {
          videoRef.current.playbackRate = parseFloat(
            settings.videoPlaybackSpeed
          )
        }
      } else {
        videoRef.current.pause()
      }
    }

    function checkForNewFrame() {
      if (!renderLoopRunning) return
      if (!videoRef.current) return
      const newVideoTime = Math.floor(videoRef.current.currentTime * 1000)
      if (videoTime !== newVideoTime) {
        onChangeVideoTime(newVideoTime)
      }
      if (videoRef.current.paused) {
        renderLoopRunning = false
        onChangeVideoPlaying(false)
      }
      requestAnimationFrame(checkForNewFrame)
    }
    checkForNewFrame()

    return () => {
      renderLoopRunning = false
    }
  }, [videoPlaying])

  const onLoadedVideoMetadata = useEventCallback((event) => {
    const videoElm = event.currentTarget
    videoElm.currentTime = (videoTime || 0) / 1000
    if (onLoad)
      onLoad({
        naturalWidth: videoElm.videoWidth,
        naturalHeight: videoElm.videoHeight,
        videoElm: videoElm,
        duration: videoElm.duration,
      })
  })
  const onImageLoaded = useEventCallback((event) => {
    if (onLoad) {
      const imageElm = event.target;
      const cv = document.createElement("CANVAS");

      cv.width = imageElm.naturalWidth;
      cv.height = imageElm.naturalHeight;
      cv.getContext("2d").drawImage(imageElm, 0, 0);

      onLoad({
        naturalWidth: imageElm.naturalWidth,
        naturalHeight: imageElm.naturalHeight,
        base64: cv.toDataURL("image/jpeg"),
      });
    }
  })
  const onImageError = useEventCallback((event) => {
    setError(
      `<h4 style="margin: 1rem">Could not load image</h4><p style="margin: 1rem">Make sure your image works by visiting <a href="${imageSrc || videoSrc}" target="_blank">${imageSrc || videoSrc}</a> in a web browser.</p><p style="margin: 1rem">If that URL works, the server hosting the URL may be not allowing you to access the image from your current domain. Adjust server settings to enable the image to be viewed.</p>${!useCrossOrigin ? "" : `<p style="margin: 1rem">Your image may be blocked because it's not being sent with CORs headers. To do pixel segmentation, browser web security requires CORs headers in order for the algorithm to read the pixel data from the image. CORs headers are easy to add if you're using an S3 bucket or own the server hosting your images.</p>`}`
    );

    if (onError) {
      onError();
    }
  })

  const stylePosition = useMemo(() => {
    let width = imagePosition.bottomRight.x - imagePosition.topLeft.x
    let height = imagePosition.bottomRight.y - imagePosition.topLeft.y
    return {
      imageRendering: "pixelated",
      left: imagePosition.topLeft.x,
      top: imagePosition.topLeft.y,
      width: isNaN(width) ? 0 : width,
      height: isNaN(height) ? 0 : height,
    }
  }, [
    imagePosition.topLeft.x,
    imagePosition.topLeft.y,
    imagePosition.bottomRight.x,
    imagePosition.bottomRight.y,
  ])

  if (!videoSrc && !imageSrc)
    return <Error>No imageSrc or videoSrc provided</Error>

  if (error) return <Error dangerouslySetInnerHTML={{ __html: error }} />

  return (
    <ThemeProvider theme={theme}>
      {imageSrc && videoTime === undefined ? (
        <StyledImage
          {...mouseEvents}
          src={imageSrc}
          ref={imageRef}
          style={stylePosition}
          onLoad={onImageLoaded}
          onError={onImageError}
          crossOrigin={useCrossOrigin ? "anonymous" : undefined}
          id={imageId}
        />
      ) : (
        <Video
          {...mouseEvents}
          ref={videoRef}
          style={stylePosition}
          onLoadedMetadata={onLoadedVideoMetadata}
          src={videoSrc || imageSrc}
        />
      )}
    </ThemeProvider>
  )
}
