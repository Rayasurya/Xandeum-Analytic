import React from "react"
import HeaderButton from "../HeaderButton"
import Box from "@mui/material/Box"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Button from "@mui/material/Button"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const emptyObj = {}

const Container = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  backgroundColor: "#fff",
  borderBottom: "1px solid #ccc",
  alignItems: "center",
  flexShrink: 1,
  boxSizing: "border-box",
  height: 73,
}))

type Props = {|
  leftSideContent?: ?React.Node,
  onClickItem?: Function,
  items: Array<{|
    name: string,
    icon?: ?React.Node,
    onClick?: Function,
  |}>,
|}

export const Header = ({
  leftSideContent = null,
  hideHeaderText = false,
  items,
  onClickItem,
}: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box
          key={"header-left-side-content"}
          display={"flex"}
          style={{ minWidth: 397, flex: 1, padding: "12px" }}
        >
          {leftSideContent}
        </Box>
        <Box
          key={"header-right-side-content"}
          display={"flex"}
          style={{ borderLeft: "1px solid #dedeec", padding: "12px" }}
        >
          {items.map((item) => {
            return (
              <HeaderButton
                key={"header-item-" + item.name}
                hideText={hideHeaderText}
                onClick={() => onClickItem(item)}
                {...item}
              />
            )
          })}
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default Header
