// @flow

import React, {useEffect, useRef, useState} from "react"
import { RemoveScroll } from "react-remove-scroll"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import useEventCallback from "use-event-callback"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const Container = styled("div")(({ theme }) => ({
  "& > div": {
    width: "100%",
    height: "100%",
  },
}))

export const PreventScrollToParents = ({ children, ...otherProps }) => {
  const unmounted = useRef(false)
  const [mouseOver, changeMouseOver] = useState(false)
  const onMouseMove = useEventCallback((e) => {
    if (!mouseOver) changeMouseOver(true)
    if (otherProps.onMouseMove) {
      otherProps.onMouseMove(e)
    }
  })
  const onMouseLeave = useEventCallback((e) => {
    setTimeout(() => {
      if (!unmounted.current && mouseOver) {
        changeMouseOver(false)
      }
    }, 100)
  })

  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container
        {...otherProps}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <RemoveScroll enabled={mouseOver} removeScrollBar={false}>
          {children}
        </RemoveScroll>
      </Container>
    </ThemeProvider>
  )
}

export default PreventScrollToParents
