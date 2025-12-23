import React, { useEffect } from "react"
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import * as muiColors from "@mui/material/colors"
import SidebarBoxContainer from "../SidebarBoxContainer"
import colors from "../colors"
import BallotIcon from "@mui/icons-material/Ballot"
import capitalize from "lodash/capitalize"
import classnames from "classnames"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const LabelContainer = styled("div")(({ theme }) => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.5,
  // backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}))
const Circle = styled("div")(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}))
const Label = styled("div")(({ theme }) => ({
  fontSize: 11,
  color: "#000",
}))
const DashSep = styled("div")(({ theme }) => ({
  flexGrow: 1,
  borderBottom: `2px dotted #000}`,
  marginLeft: 8,
  marginRight: 8,
}))
const Number = styled("div")(({ theme }) => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: "#000",
}))

export const ClassSelectionMenu = ({
  selectedCls,
  regionClsList,
  onSelectCls,
  clsColorsList,
}) => {
  useEffect(() => {
    const keyMapping = {}
    for (let i = 0; i < 9 && i < regionClsList.length; i++) {
      keyMapping[i + 1] = () => onSelectCls(regionClsList[i])
    }
    const onKeyDown = (e) => {
      if (keyMapping[e.key]) {
        keyMapping[e.key]()
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [regionClsList, selectedCls])

  const clsColorsListMutable = clsColorsList.asMutable();

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title="Classifications"
        subTitle=""
        icon={<BallotIcon style={{ color: muiColors.grey[700] }} />}
      >
        {regionClsList.map((label, index) => (
          <LabelContainer
            key={"regionClsList" + index}
            className={classnames({ selected: label === selectedCls })}
            onClick={() => onSelectCls(label)}
          >
            <Circle
              style={{ backgroundColor: clsColorsListMutable[label] ?? colors[index % colors.length] }}
            />
            <Label className={classnames({ selected: label === selectedCls })}>
              {capitalize(label)}
            </Label>
            <DashSep />
            <Number className={classnames({ selected: label === selectedCls })}>
              {index < 9 ? `Key [${index + 1}]` : ""}
            </Number>
          </LabelContainer>
        ))}
        <Box pb={2} />
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default ClassSelectionMenu
