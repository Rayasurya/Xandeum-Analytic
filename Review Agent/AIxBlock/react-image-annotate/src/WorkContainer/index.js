import React from "react"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { grey } from "@mui/material/colors"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const Container = styled("div")(({ theme }) => ({
  position: "relative",
  flexGrow: 1,
  flexShrink: 1,
  height: "100%",
  // backgroundColor: "#111",
  overflowY: "auto",
  borderRight: "0.5px solid rgba(20, 20, 43, 0.4)",
}))
const ShadowOverlay = styled("div")(({ theme }) => ({
  content: "' '",
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  pointerEvents: "none",
}))

export const WorkContainer = React.forwardRef(({ children }, ref) => {
  return (
    <ThemeProvider theme={theme}>
      <Container ref={ref}>
        {children}
        <ShadowOverlay />
      </Container>
    </ThemeProvider>
  )
})

export default WorkContainer
