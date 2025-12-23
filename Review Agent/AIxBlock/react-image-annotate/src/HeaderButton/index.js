// @flow

import React from "react"
import Button from "@mui/material/Button"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { useIconDictionary } from "../icon-dictionary.js"
import { iconMapping } from "../icon-mapping.js"
import { Tooltip } from "@mui/material"
import {
  IconDelete,
  IconFullScreen,
  IconSettings,
} from "../IconEditor/index.js"
import IconUndo from "../CustomIcon/IconUndo.js"
import IconRedo from "../CustomIcon/IconRedo.js"
import IconTrashBin from "../CustomIcon/IconTrashBin.js"
import IconCancel from "../CustomIcon/IconCancel.js"
import IconSend from "../CustomIcon/IconSend.js"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const defaultNameIconMapping = iconMapping

const getIcon = (name, customIconMapping) => {
  const Icon =
    customIconMapping[name.toLowerCase()] ||
    defaultNameIconMapping[name.toLowerCase()] ||
    defaultNameIconMapping.help
  return <Icon />
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  width: 40,
  marginLeft: 1,
  marginRight: 1,
  "& svg": {
    height: "20px",
  },
}))

const StyledButtonSave = styled(Button)(({ theme }) => ({
  minWidth: "135px !important",
  height: 32,
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
  padding: "8px 10px",
  borderRadius: "8px !important",
  boxShadow: "0 1px 2px -1px rgba(17, 12, 34, 0.08)",
  background: "linear-gradient(to right, #55f 1%, #f3a2cf 100%)",

  fontSize: "12px",
  fontWeight: "600",
  fontStretch: "normal",
  fontStyle: "normal",
  lineHeight: "1.33",
  letterSpacing: "normal",
  textAlign: "left",
  color: "#f4f5f9 !important",
}))
const ButtonInnerContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}))
const IconContainer = styled("div")(({}) => ({
  color: "#888C90",
  // height: textHidden ? 32 : 20,
  // paddingTop: textHidden ? 8 : 0,
  "& .MuiSvgIcon-root": {
    width: 32,
    height: 32,
  },
}))

export const HeaderButton = ({ name, tooltip, icon, disabled, onClick }) => {
  const customIconMapping = useIconDictionary()
  return (
    <ThemeProvider theme={theme}>
      {name.toLowerCase() === "prev" && (
        <Tooltip title={tooltip ?? name} placement="bottom">
          <StyledButton onClick={onClick} disabled={disabled}>
            <img src="/static/images/undo.svg" alt="next" />
          </StyledButton>
        </Tooltip>
      )}
      {name.toLowerCase() === "next" && (
        <Tooltip title={tooltip ?? name} placement="bottom">
          <StyledButton onClick={onClick} disabled={disabled}>
            <img src="/static/images/redo.svg" alt="prev" />
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "undo" && (
        <Tooltip title={tooltip ?? name} placement="bottom">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconUndo />
          </StyledButton>
        </Tooltip>
      )}
      {name.toLowerCase() === "redo" && (
        <Tooltip title={tooltip ?? name} placement="bottom">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconRedo />
          </StyledButton>
        </Tooltip>
      )}

      {![
        "undo",
        "redo",
        "next",
        "prev",
        "save",
        "cancel",
        "delete",
        "settings",
        "fullscreen",
        "window",
      ].includes(name.toLowerCase()) && (
        <Tooltip title={tooltip ?? name} placement="bottom">
          <StyledButton onClick={onClick} disabled={disabled}>
            <ButtonInnerContent>
              <IconContainer>
                {icon || getIcon(name, customIconMapping)}
              </IconContainer>
            </ButtonInnerContent>
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "delete" && (
        <Tooltip title={tooltip ?? name} placement="bottom-end">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconTrashBin />
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "save" && (
        <Tooltip title={tooltip ?? name} placement="bottom-end">
          <StyledButtonSave onClick={onClick} disabled={disabled}>
            Submit <IconSend />
          </StyledButtonSave>
        </Tooltip>
      )}

      {name.toLowerCase() === "settings" && (
        <Tooltip title={tooltip ?? name} placement="bottom-end">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconSettings />
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "fullscreen" && (
        <Tooltip title={tooltip ?? name} placement="bottom-end">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconFullScreen />
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "window" && (
        <Tooltip title={tooltip ?? "Exit fullscreen"} placement="bottom-end">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconFullScreen />
          </StyledButton>
        </Tooltip>
      )}

      {name.toLowerCase() === "cancel" && (
        <Tooltip title={tooltip ?? name} placement="bottom-end">
          <StyledButton onClick={onClick} disabled={disabled}>
            <IconCancel />
          </StyledButton>
        </Tooltip>
      )}
    </ThemeProvider>
  )
}

export default HeaderButton
