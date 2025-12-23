import React, { useReducer, useEffect, useMemo } from "react"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const Container = styled("div")(() => ({
  width: 0,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flexShrink: 0,
  // backgroundColor: "#111111",
  position: "relative",
  // transition: "width 500ms",
  "&.expanded": {
    width: 300,
  },
}))

const Slider = styled("div")(() => ({
  border: "solid 1px rgba(255,255,255,.1)",
  backgroundColor: "#fff",
  borderRadius: 16,
  position: "absolute",
  right: 0,
  top: 16,
  width: 0,
  bottom: 16,
  overflow: "hidden",
  overflowY: "auto",
  // transition: "opacity 500ms, left 500ms, width 500ms",
  "&.expanded": {
    width: 300,
    right: 0,
  },
}))
const InnerSliderContent = styled("div")(() => ({
  width: "100%",
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
}))

const Expander = styled("div")(() => ({
  width: "11px",
  height: "65px",
  backgroundColor: "#2A46FF",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: "44%",
  left: -14,
  zIndex: 4,
  borderRadius: "100px",
  cursor: "pointer",
  "&.expanded": {
    left: -5,
  }
}))

const ExpanderLine = styled("div")(() => ({
  width: "2px",
  height: "34px",
  backgroundColor: "#fff",
  borderRadius: "100px",
}))

const getInitialExpandedState = () => {
  try {
    return JSON.parse(window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED)
  } catch (e) {
    return window.innerWidth > 1000
  }
}

export const RightSidebar = ({ children, initiallyExpanded, height, /*showTasks = true, isExpand = false,*/ canExpandCollapse = true }) => {
  const [expanded, toggleExpanded] = useReducer(
    (state) => !state,
    initiallyExpanded === undefined
      ? getInitialExpandedState()
      : initiallyExpanded
  )

  // if (showTasks) {
  //   height = height - 130;
  // } else {
  //   height = height - (isExpand ? 24 : 14);
  // }
  //
  // if (isExpand) {
  //   height += 80;
  // }

  useEffect(() => {
    if (initiallyExpanded === undefined) {
      window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED =
        JSON.stringify(expanded)
    }
  }, [initiallyExpanded, expanded])

  const containerStyle = useMemo(() => ({
    height: height ? height - 73 : "100%",
  }), [height])

  return (
    <ThemeProvider theme={theme}>
      <Container className={expanded ? "expanded" : ""} style={containerStyle}>
        <Slider className={expanded ? "expanded" : ""} id="ria-right-sidebar">
          <InnerSliderContent>{children}</InnerSliderContent>
        </Slider>
        <Expander onClick={() => {if (canExpandCollapse) { toggleExpanded() }}} className={expanded ? "expanded" : ""}>
					<ExpanderLine />
        </Expander>
      </Container>
    </ThemeProvider>
  )
}

export default RightSidebar
